import { pool } from "../config/db";

export async function addSlot(req, res) {
    try {

        const userId = req.user.id;
        const [] = req.body;
        
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ success:false, message:"Internal server error" });
    }
}


export async function deleteSlot(req, res) {
    try {
        
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ success:false, message:"Internal server error" });
    }
}