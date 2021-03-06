import React from "react";

export default function InputOptions(props) {
  const { size, setSelectedSize } = props;

  return [2, 3, 4].map((vi, index) => {
    return (
      <span key={vi}>
        <button
          id={vi}
          name={vi}
          value={vi}
          checked={vi === size}
          onClick={(e) => {
            const size = parseInt(e.target.value);
            setSelectedSize(size);
          }}
          style={{
            border: `1px solid ${vi === size ? "#5F71F3" : "#C5C5C5"}`,
            marginRight: "8px",
            color: vi === size ? "#5F71F3" : "#C5C5C5",
          }}
        >
          Power of {vi} ({2 ** vi} inputs)
        </button>
      </span>
    );
  })
}
