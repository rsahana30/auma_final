import React from "react";

const SETable = ({ result }) => {
  if (!result || (Array.isArray(result) && result.length === 0)) return null;

  const data = Array.isArray(result) ? result : [result];

  // Define keys to exclude from display
  const excludeKeys = ["rfqNo", "customerId", "productGroupId"];

  // Get displayable columns from the first row
  const columns = Object.keys(data[0]).filter((key) => !excludeKeys.includes(key));

  return (
    <div className="mt-4">
      <h5>SE Mapping Result</h5>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            {columns.map((key, index) => (
              <th key={index}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>{String(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SETable;
