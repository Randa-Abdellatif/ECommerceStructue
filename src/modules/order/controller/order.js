import cartModel from "../../../../DB/model/Cart.model.js"
import couponModel from "../../../../DB/model/Coupon.model.js"
import orderModel from "../../../../DB/model/Order.model.js"
import productModel from "../../../../DB/model/Product.model.js"
import { ErrorClass } from "../../../utils/errorClass.js"
import Stripe from 'stripe';

const stripe = new Stripe(process.env.stripeKey);

export const createOrder = async (req, res, next) => {
    let { products, address, phone, note, coupon, paymentMethod} = req.body
    const cart = await cartModel.findOne({userId: req.user._id})
    if(!req.body.products){
        products = cart.products
        if(!products.length){
        return next(new ErrorClass('cart is empty', 404))
    }
    }
    
    if(coupon){
        const isCouponExist = await couponModel.findOne({code:coupon})
        
        if(!isCouponExist){
            return next(new ErrorClass('coupon not found', 404))
        }
        if(isCouponExist.expireDate < Date.now() || isCouponExist.numOfUses <= isCouponExist.usedBy.length){
            return next(new ErrorClass('coupon expired', 403))
        }
        if(isCouponExist.usedBy.includes(req.user._id)){
            return next(new ErrorClass('this coupon used by this user before', 403))
        }
        req.body.coupon = isCouponExist
    }
    const foundedIds = [], existedProducts = [], arrayForStock = []
    let price = 0

    for(const product of products){
        const checkProduct = await productModel.findById(product.product)
        if(!checkProduct){
            return next(new ErrorClass(`product ${product.product} not found`, 404))
        }
        if(checkProduct.stock < product.quantity){
            return next(new ErrorClass(`product ${product.product} out of stock`, 404))
        }
        existedProducts.push({
            product:{
                name:checkProduct.name,
                price:checkProduct.price,
                paymentPrice:checkProduct.paymentPrice,
                productId:checkProduct._id
            },
            quantity: product.quantity
        })
        arrayForStock.push({product:checkProduct,quantity:product.quantity})
        foundedIds.push(checkProduct._id)
        price += (checkProduct.paymentPrice * product.quantity)
     
    }

    for(const product of arrayForStock){
        product.product.stock = product.product.stock - product.quantity
        await product.product.save()
    }

    

    if(req.body.products){
        await cartModel.updateOne({userId: req.user._id},{
        $pull:{
            products:{
                product:{
                    $in:foundedIds
                }
            }
        }
    })
    } else {
        await cartModel.updateOne({userId: req.user._id},{products:[]})
    }

    

    const order = await orderModel.create({
        userId: req.user._id,
        address, phone, note,
        couponId: req.body.coupon?._id,
        paymentMethod,
        status:paymentMethod == 'card' ? 'waitPayment':'placed',
        products:existedProducts,
        price,
        paymentPrice:(price - (price * ((req.body.coupon?.amount || 0) / 100)))
    })

    if(req.body.coupon){
        await couponModel.updateOne({code:req.body.coupon.code},{
            $addToSet:{
                usedBy:req.user._id
            }
        })
        console.log({isCouponExist:req.body.coupon})
    }
   
    if (paymentMethod == 'card') {
        if(req.body.coupon){
            const coupon = await stripe.coupons.create({percent_off:req.body.coupon.amount, duration:'once'})
            req.body.stripeCoupon = coupon.id
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode:'payment',
            customer_email:req.user.email,
            metadata:{
                orderId:order._id.toString()
            },
            cancel_url:process.env.cancelURL,
            success_url: process.env.successURL,
            discounts: req.body.stripeCoupon? [{coupon:req.body.stripeCoupon}] :[],
            line_items: existedProducts.map(ele =>{
                return  {
                    price_data: {
                        currency:"EGP",
                        product_data:{
                            name: ele.product.name,
                        },
                        unit_amount: ele.product.paymentPrice * 100,
                    },
                    quantity:ele.quantity,
                }
            })
           
        })
        return res.status(201).json({message:'done',order, url:session.url})
    }

    
    
    return res.status(201).json({message:'done',order})
    
}

export const webhook = async  (req, res) => {
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const order = await orderModel.findByIdAndUpdate(event.data.object.metadata.orderId,{
            status:'placed'
        },{
            new:true
        })
        res.json({order})
        break;
      // ... handle other event types
      default:
        res.json({message: 'in-valid payment'});
    }
  
  }