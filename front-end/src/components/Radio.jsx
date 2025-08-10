
import React from "react";
import "../styles/Radio.css";

const Radio = ({ options = [], name, value, onChange }) => {
	return (
		<div className="radio-group">
			{options.map((option, idx) => (
				<label className="radio-label" key={option.value}>
					<input
						type="radio"
						className="radio-input"
						name={name}
						value={option.value}
						checked={value === option.value}
						onChange={onChange}
					/>
					<span className="custom-radio" />
					<span className="radio-text">{option.label}</span>
				</label>
			))}
		</div>
	);
};

export default Radio;
