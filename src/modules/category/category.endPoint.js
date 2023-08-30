import { roles } from "../../middleware/auth.js";

export const endPoints = {
    categoryCrud:[roles.admin]
}