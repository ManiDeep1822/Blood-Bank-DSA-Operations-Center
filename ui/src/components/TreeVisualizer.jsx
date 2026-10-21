import React from 'react';

// Computes tree layout coordinates
function computeLayout(node, depth = 0, left = 0, right = 1000) {
  if (!node) return null;
  const x = (left + right) / 2;
  const y = depth * 80 + 50;

  const leftChild = computeLayout(node.left, depth + 1, left, x);
  const rightChild = computeLayout(node.right, depth + 1, x, right);

  return {
    ...node,
    x,
    y,
    left: leftChild,
    right: rightChild
  };
}

// Flattens tree into nodes and links for SVG rendering
function flattenTree(node, nodes = [], links = []) {
  if (!node) return { nodes, links };
  nodes.push(node);

  if (node.left) {
    links.push({
      x1: node.x,
      y1: node.y,
      x2: node.left.x,
      y2: node.left.y
    });
    flattenTree(node.left, nodes, links);
  }

  if (node.right) {
    links.push({
      x1: node.x,
      y1: node.y,
      x2: node.right.x,
      y2: node.right.y
    });
    flattenTree(node.right, nodes, links);
  }

  return { nodes, links };
}

export default function TreeVisualizer({ root, type = 'bst' }) {
  if (!root) {
    return (
      <div className="w-full h-64 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm">
        Tree structure is currently empty. Add records to render nodes.
      </div>
    );
  }

  const layoutRoot = computeLayout(root, 0, 40, 960);
  const { nodes, links } = flattenTree(layoutRoot);

  const maxY = Math.max(...nodes.map(n => n.y), 200) + 60;

  return (
    <div className="w-full overflow-x-auto bg-slate-50 border border-slate-200 rounded-lg p-4">
      <div className="text-xs font-mono text-slate-500 mb-2 flex items-center justify-between">
        <span>{type === 'bst' ? 'BINARY SEARCH TREE HIERARCHY (Keyed by Donor ID)' : 'MAX-HEAP PRIORITY TREE (Urgency & Timestamp)'}</span>
        <span>{nodes.length} Active Nodes</span>
      </div>
      <div className="min-w-[900px] flex justify-center">
        <svg width="1000" height={maxY} className="overflow-visible">
          {/* Connector Links */}
          {links.map((link, idx) => (
            <line
              key={idx}
              x1={link.x1}
              y1={link.y1}
              x2={link.x2}
              y2={link.y2}
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray={type === 'heap' ? '4 2' : 'none'}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, idx) => {
            const isHeap = type === 'heap';
            const badgeBg = isHeap
              ? node.urgency === 3
                ? '#fecaca'
                : node.urgency === 2
                ? '#fef08a'
                : '#e2e8f0'
              : '#fee2e2';

            const badgeBorder = isHeap
              ? node.urgency === 3
                ? '#ef4444'
                : node.urgency === 2
                ? '#eab308'
                : '#94a3b8'
              : '#dc2626';

            return (
              <g key={idx} transform={`translate(${node.x}, ${node.y})`}>
                {/* Node Pill Background */}
                <rect
                  x="-75"
                  y="-22"
                  width="150"
                  height="44"
                  rx="6"
                  fill="#ffffff"
                  stroke={badgeBorder}
                  strokeWidth="1.5"
                  className="shadow-xs"
                />
                
                {/* Blood Group Tag */}
                <rect
                  x="-70"
                  y="-16"
                  width="36"
                  height="32"
                  rx="4"
                  fill={badgeBg}
                />
                <text
                  x="-52"
                  y="5"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#991b1b"
                >
                  {node.bloodGroup}
                </text>

                {/* Primary ID / Name */}
                <text
                  x="-26"
                  y="-2"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#0f172a"
                >
                  {isHeap ? `Req #${node.requestId}` : `ID: #${node.id}`}
                </text>

                {/* Secondary detail */}
                <text
                  x="-26"
                  y="12"
                  fontSize="10"
                  fill="#64748b"
                >
                  {isHeap
                    ? (node.patientName?.length > 12 ? node.patientName.substring(0, 10) + '..' : node.patientName)
                    : (node.name?.length > 12 ? node.name.substring(0, 10) + '..' : node.name)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
