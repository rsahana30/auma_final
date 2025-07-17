// SETable.js
import React from "react";

const SETable = ({ result }) => {
  if (!result || (Array.isArray(result) && result.length === 0)) return null;

  // Support both single object and array
  const data = Array.isArray(result) ? result : [result];

  return (
    <div className="mt-4">
      <h5>SE Mapping Result</h5>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            {Object.keys(data[0]).map((key, index) => (
              <th key={index}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((value, colIndex) => (
                <td key={colIndex}>{String(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SETable;
