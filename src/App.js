import { useState, useEffect } from "react";
import InputOptions from "./components/InputOptions";
import { MerkleTree } from "./utils/merkle";
import { words } from "./utils/words";

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
      const nodeIndex = nodes.findIndex((n) => n.id === id);
      if (nodeIndex > -1) {
        if (depth === 0) {
          y = 2 * index + 1; // row
        } else {
          const lcIndex = nodes.findIndex((n) => n.id === leftChildId);
          const rcIndex = nodes.findIndex((n) => n.id === rightChildId);
          if (lcIndex > -1 && rcIndex > -1) {
            y = (nodes[lcIndex].y + nodes[rcIndex].y) / 2;
          }
        }
        nodes[nodeIndex] = {
          x,
          y,
          ...node,
        };
      }
    });
  const [textInput, setTextInput] = useState(
    nodes.filter((node) => node.depth === 0)
  );
  const [nodestoHighlight, setNodestoHighlight] = useState([]);

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
        gridTemplateRows: `repeat(${actualCount}, 1fr)`,
        gridTemplateColumns: `repeat(${power}, 1fr)`,
      }}
    >
      {textInput.map((e, i) => {
        return (
          <div
            key={e.id}
            style={{
              gridColumnStart: 1,
              gridColumnEnd: 1,
              gridRowStart: e.y,
              gridRowEnd: e.y,
            }}
          >
            <textarea value={e.value} onChange={(ev) => onChange(ev, e)} />
          </div>
        );
      })}
      {nodes.map((node, j) => {
        const { x, y } = node;
        return (
          <div
            key={node.id}
            style={{
              gridColumnStart: x,
              gridColumnEnd: x,
              gridRowStart: y,
              gridRowEnd: y,
              color: nodestoHighlight.includes(node.id) ? "red" : "black",
            }}
          >
            {node.hash.substring(0, 7)}...
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const defaultTree = new MerkleTree(["shallow", "bare", "letter", "freezing"]);
  const [selectedSize, setSelectedSize] = useState(2);
  const [tree, setTree] = useState(defaultTree);

  return (
    <div>
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
    </div>
  );
}

export default App;
