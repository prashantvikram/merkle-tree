import React from "react";

export default function InputOptions(props) {
  const { size, setSelectedSize } = props;

  return [2, 3, 4].map((vi) => {
    return (
      <span key={vi}>
        <input
          type="radio"
          id={vi}
          name={vi}
          value={vi}
          checked={vi === size}
          onChange={(e) => {
            const size = parseInt(e.target.value);
            setSelectedSize(size);
          }}
        />
        <label htmlFor={vi}>
          {" "}
          Power of {vi} ({2 ** vi} inputs)
        </label>
      </span>
    );
  })
}
