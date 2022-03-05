import { useState, useEffect } from "react";

import { MerkleTree } from "./utils/merkle";
import { words } from "./utils/words";

import InputOptions from "./components/InputOptions";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Tooltip from "./components/Tooltip";
import Node from "./components/Node";

export function Grid(props) {
  const { size, tree } = props;
  const power = 2 ** size;
  const actualCount = 2 * power - 1; // 2 * power of 2 - 1 or (power of 2) + (power of 2) - 1 for gaps;

  const nodes = tree.nodes;

  nodes
    .sort((a, b) => a.depth - b.depth)
    .forEach((node, index) => {
      const { id, depth, leftChildId, rightChildId } = node;
      const x = depth + 2; // column
      let y;
      let displayLabel = "";
      const nodeIndex = nodes.findIndex((n) => n.id === id);
      if (nodeIndex > -1) {
        if (depth === 0) {
          y = 2 * index + 1; // row
          displayLabel = `H${index}-${depth} = H(L${index})`;
        } else {
          const lcIndex = nodes.findIndex((n) => n.id === leftChildId);
          const rcIndex = nodes.findIndex((n) => n.id === rightChildId);
          if (lcIndex > -1 && rcIndex > -1) {
            y = (nodes[lcIndex].y + nodes[rcIndex].y) / 2;

            const leftLabel = nodes[lcIndex].displayLabel.split("=")[0].trim();
            const rightLabel = nodes[rcIndex].displayLabel.split("=")[0].trim();
            displayLabel = `H${
              index - power
            }-${depth} = H(${leftLabel} + ${rightLabel})`;
          }
        }
        nodes[nodeIndex] = {
          x,
          y,
          displayLabel,
          ...node,
        };
      }
    });
  const [textInput, setTextInput] = useState(
    nodes.filter((node) => node.depth === 0)
  );
  const [nodestoHighlight, setNodestoHighlight] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onChange = (ev, node) => {
    const clonedTextInput = [...textInput];
    const index = clonedTextInput.findIndex((c) => c.id === node.id);
    if (index > -1) {
      clonedTextInput[index].value = ev.target.value;
    }
    setTextInput(clonedTextInput);
    const { affectedNodes, wasTreeModified } = tree.verify(
      node.id,
      ev.target.value
    );
    if (wasTreeModified) {
      setNodestoHighlight((prev) => [...prev, ...affectedNodes]);
    } else {
      setNodestoHighlight([]);
    }
  };

  useEffect(() => {
    if (tree) {
      const nodes = tree.nodes;
      setTextInput(nodes.filter((node) => node.depth === 0));
    }
  }, [tree]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${power}, calc(var(--node-width) / 1.5))`,
        gridTemplateColumns: `repeat(${actualCount}, var(--node-width))`,
        columnGap: "16px",
        rowGap: "16px",
        margin: "16px 0px",
      }}
    >
      {textInput.map((e, i) => {
        return (
          <div
            key={e.id}
            style={{
              gridColumnStart: e.y,
              gridColumnEnd: e.y,
              gridRowStart: 1,
              gridRowEnd: 1,
            }}
          >
            <input value={e.value} onChange={(ev) => onChange(ev, e)} />
            <div className="node-meta">L{i}</div>
          </div>
        );
      })}
      {nodes.map((node, j) => {
        return (
          <Node
            key={node.id}
            index={j}
            node={node}
            nodestoHighlight={nodestoHighlight}
            setSelectedNode={setSelectedNode}
          />
        );
      })}

      {nodes.map((node) => {
        const { leftChildId, rightChildId } = node;
        const current = document.getElementById(node.id);
        const left = document.getElementById(leftChildId);
        const right = document.getElementById(rightChildId);
        if (left && right) {
          const currentRect = current.getBoundingClientRect();
          const leftRect = left.getBoundingClientRect();
          const rightRect = right.getBoundingClientRect();
          const startLX = leftRect.x + leftRect.width / 2;
          const startLY = leftRect.y + leftRect.height;
          const endLX = currentRect.x;
          const endLY = currentRect.y + currentRect.height / 2;

          const width = endLX - startLX;
          const height = endLY - startLY;

          const startRX = currentRect.x + currentRect.width;
          const startRY = rightRect.y + rightRect.height;

          return (
            <>
              <svg
                width={width}
                height={height}
                style={{
                  position: "absolute",
                  left: startLX,
                  top: startLY,
                }}
              >
                <line
                  x1={0}
                  y1={0}
                  x2={width}
                  y2={height}
                  stroke={
                    nodestoHighlight.includes(leftChildId)
                      ? "var(--error)"
                      : "var(--primary)"
                  }
                  stroke-dasharray={
                    nodestoHighlight.includes(leftChildId) ? "2" : "0"
                  }
                />
              </svg>
              <svg
                width={width}
                height={width}
                style={{
                  position: "absolute",
                  left: startRX,
                  top: startRY,
                }}
              >
                <line
                  x1={0}
                  y1={height}
                  x2={width}
                  y2={0}
                  stroke={
                    nodestoHighlight.includes(rightChildId)
                      ? "var(--error)"
                      : "var(--primary)"
                  }
                  stroke-dasharray={
                    nodestoHighlight.includes(rightChildId) ? "2" : "0"
                  }
                />
              </svg>
            </>
          );
        }
        return null;
      })}
      {selectedNode && <Tooltip node={selectedNode} />}
    </div>
  );
}

function App() {
  const defaultTree = new MerkleTree(["shallow", "bare", "letter", "freezing"]);
  const [selectedSize, setSelectedSize] = useState(2);
  const [tree, setTree] = useState(defaultTree);

  return (
    <div>
      <Header />
      <main>
        <InputOptions
          size={selectedSize}
          setSelectedSize={(size) => {
            const input = words
              .sort(() => 0.5 - Math.random())
              .slice(0, 2 ** size);
            setTree(new MerkleTree(input));
            setSelectedSize(size);
          }}
        />
        <Grid size={selectedSize} tree={tree} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
