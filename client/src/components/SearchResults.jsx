import React, { useState, useEffect } from "react";
import "../styles/searchResults.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { changeToIndianFormat } from "../utils/changeToIndianFormat";

const SearchResults = () => {
  const navigate = useNavigate();

  const [toShowData, setToShowData] = useState([]);
  const [searchResultData, setSearchResultData] = useState();
  const [tableScroll, setTableScroll] = useState(false);

  //to retrieve searchResults from LS
  useEffect(() => {
    if (sessionStorage.getItem("searchResults")) {
      setSearchResultData(JSON.parse(sessionStorage.getItem("searchResults")));
      ToCalculateTableData(JSON.parse(sessionStorage.getItem("searchResults")));
    } else {
      Swal.fire({
        title: "Please Search For A Part",
        icon: "info",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));
    }
  }, [sessionStorage.getItem("searchResults")]);

  const ToCalculateTableData = (searchData) => {
    // console.log(searchData && searchData.results);

    //to access searchItem without special chars that are defined in the API , i.e to change from "SML4741A-E3/61" to "SML4741AE361"
    // console.log(searchResultData && searchResultData.searchItem.replace(/[^a-zA-Z0-9 ]/g, ""))

    // all the distributors selling this searchItem
    // console.log(searchResultData && searchResultData.results[`${searchResultData && searchResultData.searchItem.replace(/[^a-zA-Z0-9 ]/g, "")}`])

    const priorityDist = [
      "Mouser Electronics India",
      "Digi-Key India",
      "element14 India",
      "Arrow Electronics",
      "RS Components UK",
      "SOS electronic",
      "Symmetry Electronics",
      "Verical",
    ];

    //Step - 1 - To calculate how many search results are present for our searchItem
    var searchResultsCnt = 0;

    for (const resultItem in searchData && searchData.results) {
      searchResultsCnt++;
      // console.log(resultItem)
    }

    // console.log(searchResultsCnt);

    //Step 2 - now to show different values in the table according to the searchResultsCnt
    if (searchResultsCnt === 1) {
      //this condition means that we got our desired searchItem

      let tableId = 1;
      let tempToShowData = [];

      priorityDist.map((curr) => {
        // console.log(curr)

        //will get all the distributors name that are present under that searchItem
        // console.log(searchData && searchData.results[`${searchData.searchItem.replace(/[^a-zA-Z0-9 ]/g, "")}`])

        //will give that object holding the part details for that 'curr' distributor in the form of '5 : {...part details}'
        //searchData && searchData.results[`${searchData.searchItem.replace(/[^a-zA-Z0-9 ]/g, "")}`][curr]

        var keyValuePair =
          searchData &&
          searchData.results[
            `${searchData.searchItem.replace(/[^a-zA-Z0-9 ]/g, "")}`
          ][curr];

        for (const obj in keyValuePair) {
          //this loop will provide us that object containing the part details i.e value part of key-value part again of '5 : {...part details}'

          var valuePart = keyValuePair[obj];

          // console.log(curr,valuePart)

          //to calculate stocks for different distributors for that part
          const distributorStocksForThatPart = ToCalculateDistributorStocks(
            searchData.results[
              `${searchData.searchItem.replace(/[^a-zA-Z0-9 ]/g, "")}`
            ]
          );

          // console.log(distributorStocks)

          //storing all the value part of key-value pair object in an array according to the priority distributor name
          tempToShowData.push({
            tableId,
            ...valuePart,
            distributorStocksForThatPart:
              distributorStocksForThatPart.distributorStocks,
            totalCumulativeDistributorsStocks:
              distributorStocksForThatPart.totalStocks,
          });
          tableId++;

          break;
        }

        // console.log(tempToShowData);

        //setting to state to display in table
        setToShowData(tempToShowData);

        sessionStorage.setItem("dataTable", JSON.stringify(tempToShowData));

        // if (tempToShowData.length > 2) {
        //   setTableScroll(true);
        // }

        return 0;
      });
    } else {
      //means we got the matching items for our searchItem
      // console.log(partName)

      let tableId = 1;
      let tempToShowData = [];
      let flagToBreakLoop = false;

      // console.log(curr)

      //will get all the distributors name that are present under that searchItem
      // console.log(searchData && searchData.results[`${searchData.searchItem.replace(/[^a-zA-Z0-9 ]/g, "")}`])

      //will give that object holding the part details for that 'curr' distributor in the form of '5 : {...part details}'
      //searchData && searchData.results[`${searchData.searchItem.replace(/[^a-zA-Z0-9 ]/g, "")}`][curr]

      //will loop for diff part names
      for (const partName in searchData && searchData.results) {
        //  console.log(partName)

        //to calculate stocks for different distributors for that part
        const distributorStocksForThatPart = ToCalculateDistributorStocks(
          searchData.results[partName]
        );

        //will loop over priority distributor array
        for (const curr of priorityDist) {
          //will loop for diff distributor names in that part name object
          for (const distName in searchData && searchData.results[partName]) {
            flagToBreakLoop = false;
            // console.log(partName,distName,curr)

            if (distName === curr) {
              // console.log(partName,distName,curr)

              //  console.log(searchData.results[partName],distName);

              //will provide us that object containing the part details i.e value part of key-value part again of '5 : {...part details}'
              // console.log(searchData && searchData.results[`${partName}`][`${curr}`])

              for (const valuePart in searchData &&
                searchData.results[`${partName}`][`${curr}`]) {
                //value part of that key-value part of the highest priority distributor name
                // console.log(searchData && searchData.results[`${partName}`][`${curr}`][`${valuePart}`])

                let value =
                  searchData &&
                  searchData.results[`${partName}`][`${curr}`][`${valuePart}`];

                // console.log(value)

                tempToShowData.push({
                  tableId,
                  ...value,
                  distributorStocksForThatPart:
                    distributorStocksForThatPart.distributorStocks,
                  totalCumulativeDistributorsStocks:
                    distributorStocksForThatPart.totalStocks,
                });
                tableId++;

                flagToBreakLoop = true;
                break;
              }

              if (flagToBreakLoop) {
                break;
              }

              // console.log(tempToShowData);
            }
          }

          //repeated break signifies that we only want the highest priority distributor's part details for that part only
          // console.log(partName, flagToBreakLoop);
          if (flagToBreakLoop) {
            break;
          }
        }
      }

      // console.log(tempToShowData);

      setToShowData(tempToShowData);

      sessionStorage.setItem("dataTable", JSON.stringify(tempToShowData));

      if (tempToShowData.length > 2) {
        // setTableScroll(true);
      }

      // console.log(tempToShowData);

      setToShowData(tempToShowData);

      sessionStorage.setItem("dataTable", JSON.stringify(tempToShowData));

      if (tempToShowData.length > 2) {
        // setTableScroll(true);
      }
    }
  };

  const ToCalculateDistributorStocks = (distributorNames) => {
    // console.log(distributorNames)

    const priorityDist = [
      "Mouser Electronics India",
      "Digi-Key India",
      "element14 India",
      "Arrow Electronics",
      "RS Components UK",
      "SOS electronic",
      "Symmetry Electronics",
      "Verical",
    ];

    const distributorStocks = [];
    let totalStocks = 0;

    priorityDist.map((curr) => {
      //if the distributor is present in the list of distributors for that part
      if (distributorNames[curr]) {
        let keyValuePair = distributorNames[curr];

        let maxStockForThatDist = 0;

        for (const obj in keyValuePair) {
          //this loop will provide us that object containing the part details i.e value part of key-value part again of '5 : {...part details}'

          var valuePart = keyValuePair[obj];

          if (valuePart.quantity_in_stock >= maxStockForThatDist) {
            maxStockForThatDist = valuePart.quantity_in_stock;
          }
        }

        totalStocks += Number(maxStockForThatDist);

        distributorStocks.push(String(maxStockForThatDist));

        // console.log(curr,maxStockForThatDist)
      } else {
        //else we will just make the stock number "-"
        distributorStocks.push("NA");
      }
    });

    return { distributorStocks, totalStocks };
  };

  return (
    <>
      {searchResultData && searchResultData ? (
        <div className="sr_container">
          <h2 className="sr_head">
            RESULTS FOR {`"${searchResultData.searchItem}"`}
          </h2>
          <div>
            <table className="sr_table">
              <tr>
                <th width="50">Sort</th>
                <th width="300">Product Details</th>
                <th width="300">Description</th>
                <th width="100">Datasheet</th>
                <th width="300">Distributor Stock</th>
                <th width="50">Total Stock</th>
              </tr>
              {searchResultData &&
                toShowData.map((part, id) => (
                  <tr key={id}>
                    <td>{part.tableId}</td>
                    <td>
                      Mfr. No : &nbsp;&nbsp;{" "}
                      <span
                        style={{
                          color: "#0053F2",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() =>
                          navigate(
                            `/datasheet?partNo=${part.source_part_number}&tableId=${part.tableId}`
                          )
                        }
                      >
                        {part.source_part_number}
                      </span>{" "}
                      <br />
                      Mfr. :
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      {part.manufacturer}
                    </td>
                    <td>{part.description}</td>
                    <td style={{ color: "#0053F2" }}>
                      {" "}
                      <a
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        href={part.datasheet_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Datasheet
                      </a>{" "}
                    </td>
                    <td>
                      <div className="d-flex justify-content-evenly">
                        <div className="d-flex flex-column align-items-end">
                          <span>Mouser :</span>
                          <span>Digikey :</span>
                          <span>element14 :</span>
                          <span>Arrow :</span>
                          <span>RS Components :</span>
                          <span>SOS electronic :</span>
                          <span>Symmetry :</span>
                          <span>Verical :</span>
                        </div>
                        <div className="d-flex justify-content-evenly flex-column">
                          {searchResultData &&
                            toShowData &&
                            part &&
                            part.distributorStocksForThatPart &&
                            part.distributorStocksForThatPart.map(
                              (distStock, id) => (
                                <span key={id}>{changeToIndianFormat(distStock)}</span>
                              )
                            )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {changeToIndianFormat(part.totalCumulativeDistributorsStocks)} <br /> In Stock
                    </td>
                  </tr>
                ))}
            </table>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default SearchResults;
