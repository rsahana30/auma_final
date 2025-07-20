import React from "react";

const SETable = ({ result }) => {
  if (!result || (Array.isArray(result) && result.length === 0)) return null;

  const data = Array.isArray(result) ? result : [result];

  // Keys to exclude from display
  const excludeKeys = ["rfqNo", "customerId", "productGroupId"];

  // Mapping of field keys to user-friendly labels
  const columnLabels = {
    itemNo: "Item No",
    valveType: "Valve Type",
    valveSize: "Valve Size",
    valveTorque: "Valve Torque (Nm)",
    valveThrust: "Valve Thrust (N)",
    stroke: "Stroke (mm)",
    appliedForce: "Applied Force (N)",
    leverArmLength: "Lever Arm Length (mm)",
    mast: "MAST",
    safetyFactor: "Safety Factor",

    // Additional calculated/display fields
    calculatedTorque: "Calculated Torque (Nm)",
    actuator: "Actuator Model",
    rpm: "RPM",
    opTime: "Operation Time (s)",
    price: "Price (₹)",
    weight: "Weight (kg)"
  };

  const columns = Object.keys(data[0]).filter((key) => !excludeKeys.includes(key));

  return (
    <div className="mt-4">
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            {columns.map((key, index) => (
              <th key={index}>{columnLabels[key] || key}</th>
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
