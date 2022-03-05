import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { v4 as uuidv4 } from "uuid";

export const hash = (data) => {
  return data != null ? Hex.stringify(sha256(data)) : "";
};

class MerkleTreeNode {
  constructor(value, depth, leftChildId, rightChildId) {
    this.id = uuidv4();
    this.value = value;
    this.depth = depth;
    this.hash = hash(value);
    this.leftChildId = leftChildId || null;
    this.rightChildId = rightChildId || null; // null for the lowest depth nodes
  }
}

export class MerkleTree {
  constructor(initialInput) {
    this.values = initialInput;
    this.nodes = [];
    this.numberOfLayers = Math.log10(initialInput.length) / Math.log10(2);
    this.root = null;
    this.generateTree(initialInput);
  }

  generateTree(initialInput) {
    this.nodes.push(...initialInput.map((i) => new MerkleTreeNode(i, 0)));
    let valueForLoop = this.nodes;
    for (let i = 1; i <= this.numberOfLayers; i++) {
      const localArray = [];
      for (let j = 0; j < valueForLoop.length; j += 2) {
        if (valueForLoop[j] && valueForLoop[j + 1]) {
          const concatenatedValue =
            valueForLoop[j].hash + valueForLoop[j + 1].hash;
          localArray.push(
            new MerkleTreeNode(
              concatenatedValue,
              i,
              valueForLoop[j].id,
              valueForLoop[j + 1].id
            )
          );
        }
      }
      valueForLoop = localArray;
      this.nodes.unshift(...localArray);
    }
    this.root = this.nodes[0];
  }

  findNeighbourOf(id) {
    const index = this.nodes.findIndex((node) => node.id === id);
    if (index === -1) {
      throw Error("value modified or missing");
    }
    // if index is even, neighbour's index would be index + 1
    const neighboursIndex = index % 2 === 0 ? index + 1 : index - 1;
    return { neighbour: this.nodes[neighboursIndex], neighboursIndex };
  }

  findParentOf(id) {
    const lindex = this.nodes.findIndex((node) => node.leftChildId === id);
    const rindex = this.nodes.findIndex((node) => node.rightChildId === id);
    if (lindex > -1) {
      return { parent: this.nodes[lindex], isLeftChild: true };
    } else if (rindex > -1) {
      return { parent: this.nodes[rindex], isLeftChild: false };
    } else {
      // throw Error("value modified or missing");
      return { parent: null, isLeftChild: null };
    }
  }

  verify(id, value) {
    let idToCheck = id;
    let currentDepth = 0;
    let affectedNodes = [];
    let modifiedHash = hash(value);
    while (currentDepth <= this.numberOfLayers) {
      if (idToCheck === this.root.id) break;
      const { parent, isLeftChild } = this.findParentOf(idToCheck);
      const otherChildId = isLeftChild
        ? parent.rightChildId
        : parent.leftChildId;
      const otherChild = this.nodes.find((node) => node.id === otherChildId);
      if (otherChild) {
        modifiedHash = isLeftChild
          ? hash(modifiedHash + otherChild.hash)
          : hash(otherChild.hash + modifiedHash);
      }
      idToCheck = parent.id;
      currentDepth = parent.depth;
      affectedNodes.push(parent.id);
    }
    if (affectedNodes.length) affectedNodes.unshift(id);
    const wasTreeModified = modifiedHash !== this.root.hash;
    return { affectedNodes, wasTreeModified };
  }
}
