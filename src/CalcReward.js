import { useEffect, useState, useRef } from "react";
import "./styles.css";
import { TRANSACTION_DATA } from "./transactions.js";

// number of entries to generate in dataset
const DATASET_NUM = 10;

// only consider data from last 3 months
const VALID_MONTHS = new Set(["July", "August", "September"]);

const extractMonths = (data) => {
  let transactions = [];
  data.forEach((elem) => {
    transactions = transactions.concat(elem.transactions);
  });
  // make sure data is in the year 2024, and month is valid
  transactions = transactions.filter(
    (elem) => elem.date.startsWith("2024") && VALID_MONTHS.has(elem.month)
  );
  const monthSet = new Set();
  transactions.forEach((elem) => {
    monthSet.add(elem.month);
  });
  return Array.from(monthSet);
};

// reorganize the transactions by month
const groupTransactionsByMonth = (data, months) => {
  let result = [];
  data.forEach((elem) => {
    let entry = {
      customerId: elem.customerId,
      name: elem.name,
      transactions: {},
    };
    for (let month of months) {
      entry.transactions[month] = elem.transactions.filter(
        (transElem) => transElem.month === month
      );
    }
    result.push(entry);
  });
  return result;
};

// simulate fetching data.
const fetchTransactionData = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        resolve(TRANSACTION_DATA);
      } catch (error) {
        reject(new Error("Failed to fetch data", error));
      }
    });
  });
};

const calcPoins = (amount) => {
  if (amount <= 0) {
    return 0;
  }
  amount = Math.floor(amount);
  let result = 0;
  let twoPointAmount = amount - 100;
  if (twoPointAmount > 0) {
    result = twoPointAmount * 2;
  }
  let onePointAmount = 0;
  if (amount >= 100) {
    onePointAmount = 50;
  } else {
    onePointAmount = Math.max(amount - 50, 0);
  }
  if (onePointAmount > 0) {
    result += onePointAmount;
  }
  return result;
};

// calculate the table data from initial grouped transactions
const calcTableData = (data, months) => {
  if (data.length == 0 || months.length == 0) {
    return [];
  }
  const result = [];
  for (const entry of data) {
    let tableEntry = {
      customerId: entry.customerId,
      name: entry.name,
    };
    let totalPoints = 0;
    for (const month of months) {
      const transactions = entry.transactions[month];
      let points = 0;
      transactions.forEach((transEntry) => {
        points += calcPoins(transEntry.amount);
      });
      tableEntry[`trans_${month}`] = points;
      totalPoints += points;
    }
    tableEntry["trans_Total"] = totalPoints;
    result.push(tableEntry);
  }
  return result;
};

export default function CalcReward() {
  const [data, setData] = useState([]);
  const months = useRef([]);

  useEffect(() => {
    fetchTransactionData().then((initData) => {
      months.current = extractMonths(initData);
      console.log("months", months.current);
      initData = groupTransactionsByMonth(initData, months.current);
      console.log("grouped", initData);
      setData(initData);
    });
  }, []);

  const tableData = calcTableData(data, months.current);

  console.log("tableData", tableData);

  return (
    <div className="CalcReward">
      <table>
        <thead>
          <tr>
            <th>CustomerId</th>
            <th>Name</th>
            {months.current.map((elem) => (
              <th key={elem}>{elem}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((elem) => (
            <tr>
              <td>{elem.customerId}</td>
              <td>{elem.name}</td>
              {months.current.map((monthElem) => (
                <td key={monthElem}>{elem[`trans_${monthElem}`]}</td>
              ))}
              <td>{elem.trans_Total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
