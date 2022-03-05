import React from 'react'

export default function Tooltip(props) {
  const { node } = props
  if (!node) {
    return null;
  }
  const { id, hash, value, leftChildId,
    rightChildId, displayLabel } = node
  return (
    <div style={{
      position: "absolute",
      width: "30vw",
      height:"100%",
      top: 0,
      right: 0,
      backgroundColor: "white",
      boxShadow: "5px 10px #888888",
      fontSize: "13px",
      wordWrap: "break-word"
    }}>
      <strong>id:</strong> {id}
      <br />
      <strong>hash:</strong> {hash}
      <br />
      <strong>value:</strong> {value}
      <br />
      <strong>leftChildId:</strong> {leftChildId}
      <br />
      <strong>rightChildId:</strong> {rightChildId}
      <br />
      <strong>hash function:</strong> {displayLabel}
      </div>
  )
}
