import React, { useState, useEffect, useMemo } from "react";
import { Card } from "antd";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { debounce } from "lodash";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, Space } from "antd";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import TextField from '@mui/material/TextField';

const nodeAPIUrl = `http://localhost:5000/api/v1`;

const PurchaseOrders = () => {
  const [shipByDate, setShipByDate] = useState("");
  const paymentStatus = [
    {
      value: "not paid",
      label: "Not Paid",
    },
    {
      value: "partially paid",
      label: "Partially Paid",
    },
    {
      value: "paid",
      label: "Paid",
    },
  ];
  const poStatus = [
    {
      value: "none received",
      label: "None Received",
    },
    {
      value: "partially received",
      label: "Partially Received",
    },
    {
      value: "received",
      label: "Received",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
    {
      value: "pending",
      label: "Pending",
    },
  ];
  const warehouses = [
    {
      value: "warehouse a",
      label: "Warehouse A",
    },
    {
      value: "warehouse b",
      label: "Warehouse B",
    },
    {
      value: "warehouse c",
      label: "Warehouse C",
    },
  ];
  const columnDefs = useMemo(
    () => [
      {
        field: "sku",
        headerName: "SKU",
        headerTooltip: "SKU",
        cellRenderer: "agGroupCellRenderer",
      },
      {
        field: "primaryImageUrl",
        headerName: "Image",
        headerTooltip: "Image",

        width: 100,
        // cellRenderer: ({ value }) => {
        //   return <img alt="" style={{ width: 30, height: 30 }} src={value} />;
        // },
      },

      {
        field: "title",
        headerName: "Title",
        headerTooltip: "Title",
        width: 350,
      },
      {
        field: "code",
        headerName: "Article No",
        headerTooltip: "Article No",
        flex: 1,
      },
      // { field: "size", headerName: "Size", headerTooltip: "Size", flex: 1 },
      // { field: "color", headerName: "Color", headerTooltip: "Color", flex: 1 },
      {
        field: "available",
        headerName: "Stock Quantity",
        headerTooltip: "Stock Quantity",
        flex: 1,
        // cellRenderer: ({ data }) => {
        //   const { stockDetails = [] } = data || {};
        //   let totalStockQuantity = 0;
        //   if (stockDetails?.length) {
        //     stockDetails.forEach((item) => {
        //       totalStockQuantity += item.stockQuantity;
        //     });
        //   }
        //   return totalStockQuantity;
        // },
      },
    ],
    []
  );

  const onChange = (e) => {
    console.log(e);
  };

  return (
    <Card className="w-full h-[90%] relative">
      <div
        className="absolute flex gap-2 p-4"
        style={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <Card
          //   size="small"
          className="w-8/12 h-full relative"
          title="Inventory Stock"
          extra={
            <div className="flex items-center gap-4">
              <TextField
                size="small"
                label="Search"
                // onChange={handleSearch}
                variant="outlined"
                // value={searchValue}
              />
              <Button
                variant="contained"
                size="small"
                color="secondary"
                // onClick={getAllProductsWithStockDetails}
              >
                <RefreshIcon sx={{ height: 20, width: 20 }} />
              </Button>
            </div>
          }
        >
          <div
            className="absolute ag-theme-quartz"
            style={{ top: "57px", bottom: 0, left: 0, right: 0 }}
          >
            <AgGridReact
              columnDefs={columnDefs}
              rowData={[]}
              //   defaultColDef={defaultColDef}
              //   onGridReady={onGridReady}
              //   masterDetail={true}
              //   detailCellRendererParams={detailCellRendererParams}
              // pagination={true}
              // paginationPageSize={100}
              // paginationPageSizeSelector={false}
            />
          </div>
        </Card>
        <Card title={"Create PO"} className="w-4/12 h-full relative">
          <div className="flex items-center mb-2">
            <h6 className="font-semibold ">PO Information</h6>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              id="outlined-basic"
              label="PO Number"
              variant="outlined"
              size="small"
            />
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              size="small"
              options={[]}
              sx={{ width: "100%" }}
              renderInput={(params) => (
                <TextField {...params} label="Suppier" />
              )}
            />
            <TextField
              id="outlined-select-currency"
              select
              // className="pb-4"
              sx={{ width: "100%" }}
              size="small"
              label="PO Status"
              defaultValue="pending"
              // helperText="Please select your currency"
            >
              {poStatus.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              id="outlined-select-currency"
              select
              // className="pb-4"
              sx={{ width: "100%" }}
              size="small"
              label="Payment Status"
              defaultValue="not paid"
              // helperText="Please select your currency"
            >
              {paymentStatus.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className="flex items-center my-2">
            <h6 className="font-semibold">Shipping Information</h6>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              id="outlined-select-currency"
              select
              // className="pb-4"
              sx={{ width: "100%" }}
              size="small"
              label="Ship To Warehouse"
              defaultValue="not paid"
              // helperText="Please select your currency"
            >
              {warehouses.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <DatePicker onChange={onChange} />
            <div className="grid col-span-2">
              <TextField
                id="outlined-multiline-static"
                label="Note to Supplier"
                multiline
                rows={4}
                // defaultValue="Note to Supplier"
              />
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default PurchaseOrders;
