
import React from "react";
import "../styles/Data.css";
import { Calendar } from "lucide-react";

const Data = ({ label, value, onChange, placeholder, ...props }) => {
	return (
		<div className="data-group">
			{label && <label className="data-label">{label}</label>}
			<div className="data-input-container">
				<input
					className="data-input"
					type="date"
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					{...props}
				/>
				<span className="data-icon">
					<Calendar size={28} />
				</span>
			</div>
		</div>
	);
};

export default Data;
