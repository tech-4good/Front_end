
import React from "react";
import "../styles/Select.css";

const Select = ({ label, options = [], value, onChange, placeholder, name, id, className }) => {
		return (
			<div className="select-group">
				{label && <label className="select-label">{label}</label>}
				<div className="select-wrapper">
					<select
						id={id}
						name={name}
						className={`select-personalizado ${className || ''}`}
						value={value}
						onChange={onChange}
					>
						{placeholder && (
							<option value="" disabled>{placeholder}</option>
						)}
						{options.map((option, idx) => (
							<option key={option.value || option} value={option.value || option}>
								{option.label || option}
							</option>
						))}
					</select>
				</div>
			</div>
		);
};

export default Select;
