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
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";

const nodeAPIUrl = `http://localhost:5000/api/v1`;
let cancelToken;
let cancelToken2;

const Inventory = () => {
  const [gridApi, setGridApi] = useState(null);
  const [productList, setProductList] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchValue, setSearchVal] = useState("");
  console.log({ selectedLocation });

  const [defaultColDef] = useState({
    editable: false,
    sortable: true,
    filter: false,
    selectable: false,
    // flex: 1,
  });

  const warehouses = useMemo(
    () => [
      {
        _id: "65d9bdc91eaa28062d230c28",
        warehouseName: "Warehouse-A",
        isActive: true,
      },
      {
        _id: "65d9be731eaa28062d230c29",
        warehouseName: "Warehouse-B",
        isActive: true,
      },
      {
        _id: "65d9bea01eaa28062d230c2a",
        warehouseName: "Warehouse-C",
        isActive: true,
      },
    ],
    []
  );

  const actions = [
    {
      value: "add",
      label: "Add",
    },
    {
      value: "remove",
      label: "Remove",
    },
    {
      value: "move",
      label: "Move",
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
        cellRenderer: ({ value }) => {
          return <img alt="" style={{ width: 30, height: 30 }} src={value} />;
        },
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
        cellRenderer: ({ data }) => {
          const { stockDetails = [] } = data || {};
          let totalStockQuantity = 0;
          if (stockDetails?.length) {
            stockDetails.forEach((item) => {
              totalStockQuantity += item.stockQuantity;
            });
          }
          return totalStockQuantity;
        },
      },
    ],
    []
  );

  const detailCellRendererParams = () => {
    // console.log(params, "hhhhhh");
    return {
      detailGridOptions: {
        autoGroupColumnDef: {
          headerName: "Warehouse",
        },
        columnDefs: [
          { field: "warehouseName", rowGroup: true, hide: true },
          { field: "locationName" },
          { field: "stockQuantity" },
        ],
        // autoSizeStrategy: {
        //   type: "fitCellContents",
        // },
        defaultColDef: {
          flex: 1,
        },
      },
      getDetailRowData: (params) => {
        // console.log({ params });
        params.successCallback(params?.data?.stockDetails);
      },
    };
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const getAllProductsWithStockDetails = async () => {
    if (gridApi && gridApi?.showLoadingOverlay) gridApi.showLoadingOverlay();
    await axios
      .get(`${nodeAPIUrl}/stock-management/get-products-with-stock-details`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data && result?.data?.length) {
          setProductList(result?.data);
          if (gridApi && gridApi?.hideOverlay) gridApi.hideOverlay();
        } else {
          setProductList([]);
          if (gridApi && gridApi?.showNoRowsOverlay)
            gridApi.showNoRowsOverlay();
        }
      })
      .catch((error) => {
        if (gridApi && gridApi?.showNoRowsOverlay) gridApi.showNoRowsOverlay();
        console.error(error);
      });
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

  const getLocaionsBySearchValue = debounce((value) => {
    const params = {
      warehouseId: selectedWarehouse,
      searchValue: value || "",
    };
    if (value && value.length > 2) {
      setLocationOptions([]);
      if (cancelToken2) {
        cancelToken2.cancel("Request canceled due to new search");
      }
      cancelToken2 = axios.CancelToken.source();

      axios
        .post(`${nodeAPIUrl}/location/get-locations-by-search-value`, params, {
          cancelToken: cancelToken2.token,
        })
        .then((response) => response.data)
        .then((result) => {
          if (result?.data && result?.data?.length) {
            setLocationOptions(result?.data);
          } else {
            setLocationOptions([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, 300);

  const addRemoveMove = async () => {
    const params = {
      action: "add",
      warehouseId: selectedWarehouse || null,
      locationId: selectedLocation?._id || null,
      sku: selectedProduct?.sku || null,
      productId: selectedProduct?._id || null,
      quantity: quantity || 0,
    };

    await axios
      .post(`${nodeAPIUrl}/productInventory/add-remove-move`, params)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data && result?.data?.length) {
          console.log("success");
        } else {
          console.log("failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleWarehouseChange = (event) => {
    console.log("hhhshshsh", event?.target?.value);
    setSelectedWarehouse(event?.target?.value);
  };

  const handleChange = (e) => {
    setQuantity(e?.target?.value);
  };
  // const handleProductChange = (e) => {
  //   console.log(e, "dddd");
  //   setSelectedProduct(e.target.value);
  // };

  const handleSearch = (e) => {
    const {
      target: { value = "" },
    } = e;
    setSearchVal("");
    gridApi.setQuickFilter(value);
    setSearchVal(value);
  };

  const handleReset = () => {
    setSelectedLocation(null);
    setSelectedProduct(null);
    setQuantity("");
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

  useEffect(() => {
    if (gridApi) {
      getAllProductsWithStockDetails();
    }
    // eslint-disable-next-line
  }, [gridApi]);

  useEffect(() => {
    setSelectedWarehouse(warehouses?.[0]?._id);
  }, [warehouses]);
  return (
    <Card className="w-full h-[90%] relative">
      <div
        className="absolute flex gap-2 p-4"
        style={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <Card
          // size="small"
          className="w-9/12 h-full relative"
          title="Inventory Stock"
          extra={
            <div className="flex items-center gap-4">
              <TextField
                size="small"
                label="Search"
                onChange={handleSearch}
                variant="outlined"
                value={searchValue}
              />
              <Button
                variant="contained"
                onClick={getAllProductsWithStockDetails}
              >
                <RefreshIcon />
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
              rowData={productList}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              masterDetail={true}
              detailCellRendererParams={detailCellRendererParams}
              // pagination={true}
              // paginationPageSize={100}
              // paginationPageSizeSelector={false}
            />
          </div>
        </Card>
        <Card className="w-3/12 h-full relative">
          <div
            className="absolute p-2 flex flex-col gap-4"
            style={{ top: 0, bottom: 0, left: 0, right: 0 }}
          >
            <Card
              className="h-full w-full relative"
              size="small"
              title="Inventory Add / Remove / Move"
              bordered={false}
            >
              <div
                className="absolute flex flex-col gap-4 p-2 m-4 overflow-y-auto"
                style={{ top: "25px", bottom: 0, left: 0, right: 0 }}
              >
                <TextField
                  id="outlined-select-currency"
                  select
                  // className="pb-4"
                  sx={{ width: "100%" }}
                  size="small"
                  label="Action"
                  defaultValue="add"
                  // helperText="Please select your currency"
                >
                  {actions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Autocomplete
                  sx={{ width: "100%" }}
                  size="small"
                  // className="py-4"
                  // value={selectedProduct}
                  options={productOptions}
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
                  sx={{ width: "100%" }}
                  size="small"
                  value={quantity}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <TextField
                  id="outlined-select-currency"
                  select
                  // className="my-4"
                  sx={{ width: "100%" }}
                  size="small"
                  label="Select"
                  onChange={handleWarehouseChange}
                  defaultValue="65d9bdc91eaa28062d230c28"
                >
                  {warehouses.map((option) => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.warehouseName}
                    </MenuItem>
                  ))}
                </TextField>

                <Autocomplete
                  sx={{ width: "100%" }}
                  size="small"
                  // className="pt-4"
                  options={locationOptions}
                  onChange={(e, value) => {
                    setSelectedLocation(value);
                  }}
                  autoHighlight
                  getOptionLabel={(option) => option?.locationName}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Location"
                      onChange={(e) => {
                        getLocaionsBySearchValue(e.target.value);
                      }}
                      inputProps={{
                        ...params.inputProps,
                      }}
                    />
                  )}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={addRemoveMove}
                  >
                    Submit
                  </Button>
                  <Button size="small" variant="outlined" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </div>
            </Card>
            <Card
              className="h-full w-full relative"
              size="small"
              title="Inventory History"
              bordered={false}
            >
              <div
                className="absolute p-2"
                style={{ top: "40px", bottom: 0, left: 0, right: 0 }}
              ></div>
            </Card>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default Inventory;
