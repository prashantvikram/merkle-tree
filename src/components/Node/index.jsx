import React from 'react'

export default function Node(props) {
  const { node, nodestoHighlight, setSelectedNode } = props;
  const { x, y, displayLabel } = node;
  let extraClass = "";
  return (
    <div
      key={node.id}
      id={node.id}
      className={`node ${extraClass}`}
      style={{
        gridColumnStart: y,
        gridColumnEnd: y,
        gridRowStart: x,
        gridRowEnd: x,
        border: `3px solid ${nodestoHighlight.includes(node.id) ? "var(--error)" : "var(--primary)"}`,
      }}
      onClick={() => setSelectedNode(node)}
    >
      <div className='node-text'>
        {node.hash}
      </div>
      <div className='node-meta node-text'>
        {displayLabel}
      </div>
    </div>
  )
}
