import React, { useState, useEffect, useMemo } from "react";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  TextField,
  Autocomplete,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";

import axios from "axios";
import { debounce } from "lodash";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DatePicker as AntDatePicker, Card, Tooltip } from "antd";
const nodeAPIUrl = `http://localhost:5000/api/v1`;
let cancelToken;

const PurchaseOrders = () => {
  const currentDate = dayjs(new Date());
  const [poFormDetails, setPoFormDetails] = useState({
    poNumber: "",
    supplier: null,
    poStatus: "pending",
    paymentStatus: "not paid",
    warehouse: "warehouse a",
    shipByDate: null,
    note: "",
  });
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lineItems, setLineItems] = useState([]);

  const [quantity, setQuantity] = useState(1);

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
      {
        field: "available",
        headerName: "Stock Quantity",
        headerTooltip: "Stock Quantity",
        flex: 1,
      },
    ],
    []
  );

  const addItemColumnDefs = useMemo(
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
        // width: 100,
      },
      {
        field: "code",
        headerName: "Code",
        headerTooltip: "Article No",
        // flex: 1,
      },
      {
        field: "orderQty",
        headerName: "Order Qty",
        headerTooltip: "Stock Quantity",
        // flex: 1,
      },
      {
        field: "Item Cost",
        headerName: "Supplier Cost",
        headerTooltip: "Item Cost",
        // flex: 1,
      },
    ],
    []
  );
  const onChange = (e) => {
    console.log(e);
  };

  const ImageRenderer = (props) => {
    const {
      image = "",
      style = { height: "30px", width: "30px", objectFit: "contain" },
      className = "",
    } = props || {};
    return (
      <div>
        <img
          src={image}
          style={style || {}}
          className={className || ""}
          alt="Product Img"
          loading="lazy"
        />
      </div>
    );
  };

  const getSkuAndCode = debounce((value) => {
    const params = { searchValue: value };
    if (value && value.length > 2) {
      setProductOptions([]);
      if (cancelToken) {
        cancelToken.cancel("Request canceled due to new search");
      }
      cancelToken = axios.CancelToken.source();
      axios
        .post(`${nodeAPIUrl}/product/get-product-by-sku-code`, params, {
          cancelToken: cancelToken.token,
        })
        .then((response) => response.data)
        .then((result) => {
          if (result?.data && result?.data?.length) {
            setProductOptions(result?.data);
          } else {
            setProductOptions([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, 300);

  const handleChange = (e) => {
    setQuantity(e?.target?.value);
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
              <TextField size="small" label="Search" variant="outlined" />
              <Tooltip title="Refresh" placement="bottom">
                <IconButton size="medium" color="secondary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </div>
          }
        >
          <div
            className="absolute ag-theme-quartz p-1"
            style={{ top: "57px", bottom: 0, left: 0, right: 0 }}
          >
            <AgGridReact columnDefs={columnDefs} rowData={[]} />
          </div>
        </Card>
        <Card
          title="Create PO"
          className="w-4/12 h-full relative"
          extra={
            <Button color="success" size="small" variant="contained">
              Create PO
            </Button>
          }
        >
          <div
            className="absolute flex flex-col p-4"
            style={{ top: "56px", bottom: 0, left: 0, right: 0 }}
          >
            <div className="w-full h-full overflow-y-auto flex flex-col gap-4 pr-3">
              <div className="w-full">
                <h6 className="font-semibold ">PO Information</h6>
              </div>
              <div className="w-full">
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    id="outlined-basic"
                    label="PO Number"
                    variant="outlined"
                    size="small"
                    name="poNumber"
                    onChange={onChange}
                    value={poFormDetails?.poNumber}
                  />
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    size="small"
                    options={[]}
                    sx={{ width: "100%" }}
                    name="supplier"
                    value={poFormDetails?.supplier}
                    onChange={onChange}
                    renderInput={(params) => (
                      <TextField {...params} label="Suppier" />
                    )}
                  />
                  <TextField
                    id="outlined-select-currency"
                    select
                    sx={{ width: "100%" }}
                    size="small"
                    label="PO Status"
                    value={poFormDetails?.poStatus}
                    onChange={onChange}
                    defaultValue="pending"
                    name="poStatus"
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
                    name="paymentStatus"
                    onChange={onChange}
                    value={poFormDetails?.paymentStatus}
                    // helperText="Please select your currency"
                  >
                    {paymentStatus.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              </div>
              <hr />
              <div className="w-full">
                <h6 className="font-semibold">Shipping Information</h6>
              </div>
              <div className="w-full">
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    id="outlined-select-currency"
                    select
                    // className="pb-4"
                    sx={{ width: "100%" }}
                    size="small"
                    label="Ship To Warehouse"
                    onChange={onChange}
                    defaultValue="warehouse a"
                    name="warehouse"
                    value={poFormDetails?.warehouse}
                  >
                    {warehouses.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MobileDatePicker
                      defaultValue={dayjs(new Date().toLocaleDateString())}
                      slotProps={{ textField: { size: "small" } }}
                      name="shipByDate"
                      onChange={onChange}
                      value={
                        poFormDetails?.shipByDate
                          ? dayjs(
                              new Date(
                                poFormDetails?.shipByDate
                              ).toLocaleDateString()
                            )
                          : dayjs(new Date().toLocaleDateString())
                      }
                    />
                  </LocalizationProvider>
                  <div className="grid col-span-2">
                    <TextField
                      id="outlined-multiline-static"
                      label="Note to Supplier"
                      multiline
                      rows={3}
                      name="note"
                      onChange={onChange}
                      value={poFormDetails?.note}
                    />
                  </div>
                </div>
              </div>
              <hr />

              <div className="w-full">
                <h6 className="font-semibold">Line Items</h6>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="w-full flex items-center gap-4">
                  <Autocomplete
                    fullWidth
                    size="small"
                    // className="py-4"
                    // value={selectedProduct}
                    options={productOptions}
                    value={selectedProduct}
                    onChange={(e, value) => {
                      console.log({ value }, "kkkk");
                      setSelectedProduct(value);
                    }}
                    autoHighlight
                    getOptionLabel={(option) => option?.sku}
                    renderOption={(props, option) => (
                      <div className="my-2">
                        <div {...props} className="flex">
                          <div className="min-w-20 max-w-20">
                            <center>
                              <ImageRenderer
                                image={option?.primaryImageUrl}
                                className="min-w-20 max-w-20"
                                style={{ width: "100%" }}
                              />
                            </center>
                          </div>
                          <div className="ml-4">
                            <b>Code :</b> {option?.code}
                            <br />
                            <b>SKU :</b> {option?.sku}
                            <br />
                            <b>Title :</b>{" "}
                            {option?.title?.length > 15
                              ? `${option?.title.substring(0, 13)}...`
                              : option?.title}
                          </div>
                        </div>
                      </div>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="SKU / Code"
                        onChange={(e) => {
                          getSkuAndCode(e.target.value);
                        }}
                        inputProps={{
                          ...params.inputProps,
                        }}
                      />
                    )}
                  />
                  <TextField
                    id="outlined-number"
                    label="Quantity"
                    type="number"
                    // className="py-4"
                    sx={{ width: "50%" }}
                    size="small"
                    value={quantity}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </div>
                <div className="w-full flex items-center gap-4">
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Code"
                    variant="outlined"
                    size="small"
                    disabled
                    value={selectedProduct?.code || " "}
                  />
                  <TextField
                    // fullWidth
                    sx={{ width: "50%" }}
                    id="outlined-basic"
                    label="Supplier Cost"
                    variant="outlined"
                    size="small"
                    type="number"
                    disabled
                    value={selectedProduct?.supplierCost || 0}
                  />
                </div>
              </div>

              <div className="flex items-center justify-start">
                <Button
                  className=""
                  // color="success"
                  size="small"
                  variant="outlined"
                >
                  Add Item
                </Button>
              </div>
              <div></div>
              <div className="h-64 ag-theme-quartz p-1">
                <AgGridReact
                  containerStyle={{ height: 240 }}
                  columnDefs={addItemColumnDefs}
                  rowData={[]}
                  defaultColDef={{
                    flex: 1,
                  }}
                />
              </div>
            </div>
            <div className="w-full items-center flex gap-6 justify-end pt-4">
              <Button
                className=""
                size="small"
                color="error"
                variant="contained"
              >
                Cancel PO
              </Button>
              <Button
                className=""
                size="small"
                color="success"
                variant="contained"
              >
                Save
              </Button>
              <Button
                className=""
                size="small"
                color="secondary"
                variant="contained"
              >
                Send to Supplier
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default PurchaseOrders;
