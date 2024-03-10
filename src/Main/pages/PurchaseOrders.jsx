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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import axios from "axios";
import { debounce } from "lodash";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Card, Tooltip } from "antd";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToastContainer, toast } from "react-toastify";

const nodeAPIUrl = `http://localhost:5000/api/v1`;
let cancelToken;

const PurchaseOrders = () => {
  const [addItemsGridApi, setAddItemsGridApi] = useState(null);
  const [poFormDetails, setPoFormDetails] = useState({
    poNumber: "",
    supplier: null,
    poStatus: "pending",
    paymentStatus: "not paid",
    warehouse: {
      _id: "65d9bdc91eaa28062d230c28",
      warehouseName: "Warehouse-A",
      isActive: true,
    },
    shipByDate: null,
    note: "",
  });
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lineItems, setLineItems] = useState([]);

  const [supplierOptions, setSupplierOptions] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);

  const [quantity, setQuantity] = useState(1);

  const [poList, setPoList] = useState([]);

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

  const columnDefs = useMemo(
    () => [
      {
        field: "poNumber",

        cellRenderer: "agGroupCellRenderer",
      },
      {
        field: "poStatus",

        width: 150,
      },
      {
        field: "paymentStatus",
        width: 100,
      },

      {
        field: "shipByDate",

        width: 100,
      },
      {
        field: "warehouseName",
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
        width: 200,
      },
      {
        field: "primaryImageUrl",
        headerName: "Image",
        headerTooltip: "Image",
        width: 100,
        cellRenderer: ({ value }) => {
          return <img alt="" style={{ width: 30, height: 30 }} src={value} />;
        },
      },
      {
        field: "code",
        headerName: "Code",
        headerTooltip: "Article No",
        width: 200,
      },
      {
        field: "orderQty",
        headerName: "Order Qty",
        headerTooltip: "Stock Quantity",
        width: 150,
      },
      {
        field: "Item Cost",
        headerName: "Supplier Cost",
        headerTooltip: "Item Cost",
        width: 150,
      },
      {
        headerName: "Action",
        width: 100,

        cellRenderer: (params) => {
          const { _id = "" } = params?.data || {};
          console.log(_id);
          return (
            // <div className="flex items-center gap-2">
            // <button onClick={() => editMode(_id)}>
            //   <EditIcon sx={{ color: "#2e7d32" }} className="cursor-pointer" />
            // </button>
            <button
              onClick={() => {
                removeLineItem(_id);
              }}
            >
              <DeleteIcon sx={{ color: "red" }} className="cursor-pointer" />
            </button>
            // </div>
          );
        },
      },
    ],
    []
  );

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

  const getSupplierDetails = async () => {
    await axios
      .get(`${nodeAPIUrl}/supplier/get-all`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data && result?.data?.length) {
          setSupplierOptions(result?.data);
        } else {
          setSupplierOptions([]);
        }
      })
      .catch((error) => {
        setSupplierOptions([]);
        console.error("Error fetching data:", error);
      });
  };

  const getWarehouseDetails = async () => {
    await axios
      .get(`${nodeAPIUrl}/warehouse/get-all`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data && result?.data?.length) {
          setWarehouseOptions(result?.data);
        } else {
          setWarehouseOptions([]);
        }
      })
      .catch((error) => {
        setWarehouseOptions([]);
        console.error("Error fetching data:", error);
      });
  };
  const getPoList = async () => {
    await axios
      .get(`${nodeAPIUrl}/purchase-order/get`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data && result?.data?.length) {
          setPoList(result?.data);
        } else {
          setPoList([]);
        }
      })
      .catch((error) => {
        setPoList([]);
        console.error("Error fetching data:", error);
      });
  };

  const createPoWithLineItems = () => {
    const Items = addItemsGridApi.getRenderedNodes()?.map((node) => node?.data);
    console.log(Items);
    const data = {
      ...poFormDetails,
      lineItems: Items,
    };
    // setLoading(true);
    axios
      .post(`${nodeAPIUrl}/purchase-order/create`, data)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          toast.success("Success");
          console.log("Success");
        } else {
          // setLoading(false);
          console.error("Failed ");
          toast.error("Failed ");
        }
      })
      .catch((error) => {
        // setLoading(false);
        toast.error("Failed");
        console.error(error);
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target || {};
    console.log(event.target);
    console.log(name, value);

    setPoFormDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const onGridReady = (params) => {
    setAddItemsGridApi(params.api);
  };
  const getRowId = useMemo(() => {
    return (params) => {
      return params?.data?._id;
    };
  }, [addItemsGridApi]);

  const appendProduct = () => {
    const insertData = {
      ...selectedProduct,
      orderQty: quantity,
    };
    addItemsGridApi.applyTransaction({
      add: [insertData],
      addIndex: 0,
    });
    setSelectedProduct(null);
  };

  const removeLineItem = (_id) => {
    const rowNode = addItemsGridApi.getRowNode(_id);
    const { data = {} } = rowNode || {};
    addItemsGridApi.applyTransaction({ remove: [data] });
  };
  const detailCellRendererParams = () => {
    // console.log(params, "hhhhhh");
    return {
      detailGridOptions: {
        // autoGroupColumnDef: {
        //   headerName: "Warehouse",
        // },
        columnDefs: [
          {
            field: "primaryImageUrl",
            headerName: "Image",
            headerTooltip: "Image",
            width: 100,
            cellStyle: (params) => {
              //mark police cells as red
              return {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              };
            },
            cellRenderer: ({ value }) => {
              return (
                <img alt="" style={{ width: 30, height: 30 }} src={value} />
              );
            },
          },
          { field: "sku", flex: 1 },
          { field: "code", flex: 1 },
          { field: "orderedQty", flex: 1 },
        ],
        // autoSizeStrategy: {
        //   type: "fitCellContents",
        // },
        // defaultColDef: {
        //   flex: 1,
        // },
      },
      getDetailRowData: (params) => {
        // console.log({ params });
        params.successCallback(params?.data?.poItems);
      },
    };
  };

  useEffect(() => {
    getSupplierDetails();
    getWarehouseDetails();
    getPoList();
  }, []);

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
                <IconButton onClick={getPoList} size="medium" color="secondary">
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
            <AgGridReact
              columnDefs={columnDefs}
              masterDetail={true}
              rowData={poList}
              detailCellRendererParams={detailCellRendererParams}
            />
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
                    onChange={handleChange}
                    value={poFormDetails?.poNumber}
                  />
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    size="small"
                    options={supplierOptions}
                    getOptionLabel={(option) => option?.supplierName}
                    sx={{ width: "100%" }}
                    name="supplier"
                    // value={poFormDetails?.supplier}
                    onChange={(e, value) => {
                      // console.log({ value }, "kkkk");
                      setPoFormDetails((prev) => ({
                        ...prev,
                        supplier: value,
                      }));
                    }}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    sx={{ width: "100%" }}
                    size="small"
                    label="Ship To Warehouse"
                    onChange={handleChange}
                    defaultValue="warehouse a"
                    name="warehouse"
                    value={poFormDetails?.warehouse}
                  >
                    {warehouseOptions.map((option) => (
                      <MenuItem key={option._id} value={option}>
                        {option?.warehouseName}
                      </MenuItem>
                    ))}
                  </TextField>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MobileDatePicker
                      defaultValue={dayjs(new Date().toLocaleDateString())}
                      slotProps={{ textField: { size: "small" } }}
                      name="shipByDate"
                      onChange={(e) => {
                        const data = {
                          target: {
                            name: "shipByDate",
                            value: e ? e.$d : null,
                          },
                        };
                        handleChange(data);
                      }}
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
                      onChange={handleChange}
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
                    onChange={(e) => {
                      const { value } = e.target || {};
                      setQuantity(value);
                    }}
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
                  onClick={appendProduct}
                  size="small"
                  variant="outlined"
                >
                  Add Item
                </Button>
              </div>
              <div></div>
              <div className="h-64 ag-theme-quartz p-1">
                <AgGridReact
                  ref={addItemsGridApi}
                  containerStyle={{ height: 240 }}
                  columnDefs={addItemColumnDefs}
                  rowData={lineItems}
                  getRowId={getRowId}
                  onGridReady={onGridReady}
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
                onClick={createPoWithLineItems}
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
      <ToastContainer />
    </Card>
  );
};

export default PurchaseOrders;
