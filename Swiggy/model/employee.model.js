const mongoose = require("mongoose");

const employeeSchema = mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String },
        email: { type: String, required: true },
        department: { type: String, required: true, enum: ["Tech", "Marketing", "Operations"] }, 
        salary: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
      versionKey: false,
    }
  );

const EmployeeModel = mongoose.model("employees", employeeSchema);

module.exports={
    EmployeeModel
} 