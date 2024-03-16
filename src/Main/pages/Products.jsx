import React, { useState, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import BeatLoader from "react-spinners/BeatLoader";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";

const nodeAPIUrl = `http://localhost:5000/api/v1`;

const Products = () => {
  const [gridApi, setGridApi] = useState(null);
  const [productList, setProductList] = useState([]);
  const [productModal, setProductModal] = useState({
    open: false,
    mode: "Create",
    productId: "",
  });
  const [searchValue, setSearchVal] = useState("");

  const [product, setProduct] = useState({
    sku: "",
    code: "",
    title: "",
    primaryImageUrl: "",
    size: "",
    isActive: true,
    supplier: "",
    available: "",
    color: "",
    brand: "",
    price: "",
  });

  const [loading, setLoading] = useState(false);

  const [defaultColDef] = useState({
    editable: false,
    sortable: true,
    filter: false,
    selectable: false,
  });

  const colDefs = [
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
      field: "sku",
      headerName: "SKU",
      headerTooltip: "SKU",
    },
    { field: "title", headerName: "Title", headerTooltip: "Title", width: 350 },
    {
      field: "code",
      headerName: "Article No",
      headerTooltip: "Article No",
      flex: 1,
    },
    { field: "size", headerName: "Size", headerTooltip: "Size", flex: 1 },
    { field: "color", headerName: "Color", headerTooltip: "Color", flex: 1 },
    {
      field: "available",
      headerName: "Stock Quantity",
      headerTooltip: "Stock Quantity",
      flex: 1,
      cellRenderer: (params) => {
        const { available = 0 } = params?.data || {};
        return available || 0;
      },
    },
    {
      headerName: "Action",
      width: 100,

      cellRenderer: (params) => {
        const { _id = "" } = params?.data || {};
        return (
          <div className="flex items-center gap-2">
            <button onClick={() => editMode(_id)}>
              <EditIcon sx={{ color: "#2e7d32" }} className="cursor-pointer" />
            </button>
            <button
              onClick={() => {
                deleteMode(_id);
              }}
            >
              <DeleteIcon sx={{ color: "red" }} className="cursor-pointer" />
            </button>
          </div>
        );
      },
    },
  ];

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const handleClose = () => {
    setProductModal((prev) => ({
      ...prev,
      open: false,
    }));
    clearFields();
  };

  const editMode = (id) => {
    setProductModal((prev) => ({
      ...prev,
      open: true,
      mode: "Edit",
      productId: id || "",
    }));
    prepareEdit(id);
  };

  const createMode = () => {
    clearFields();
    setProductModal((prev) => ({
      ...prev,
      open: true,
      mode: "Create",
      productId: "",
    }));
  };

  const deleteMode = (id) => {
    clearFields();
    setProductModal((prev) => ({
      ...prev,
      open: true,
      mode: "Delete",
      productId: id || "",
    }));
  };

  const clearFields = () => {
    setProduct({
      sku: "",
      code: "",
      title: "",
      primaryImageUrl: "",
      size: "",
      isActive: true,
      supplier: "",
      available: "",
      color: "",
      brand: "",
      price: "",
    });
  };

  const handleChange = (event) => {
    const { name = "", value = "", checked = "" } = event?.target || {};
    if (name === "isActive") {
      setProduct((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOk = () => {
    const data = {
      sku: product?.sku?.trim() || "",
      code: product?.code?.trim() || "",
      title: product?.title?.trim() || "",
      primaryImageUrl: product?.primaryImageUrl?.trim() || "",
      size: product?.size,
      isActive: product?.isActive ?? true, // Using nullish coalescing operator
      supplier: product?.supplier?.trim() || "",
      available: product?.available || "",
      color: product?.color?.trim() || "",
      brand: product?.brand?.trim() || "",
      price: product?.price || "",
    };
    if (productModal?.mode === "Create" || productModal?.mode === "Edit") {
      if (!data.sku || !data.code || !data.title) {
        toast.error(`SKU, code, and title are required.`);
        return console.error(
          "Validation failed: SKU, code, and title are required."
        );
      }
    }

    if (productModal?.mode === "Create") {
      handleCreate(data);
    } else if (productModal?.mode === "Edit") {
      handleUpdate(data);
    } else {
      const { productId = "" } = productModal || {};
      handleDelete(productId);
    }
  };

  const handleCreate = (data) => {
    setLoading(true);
    axios
      .post(`${nodeAPIUrl}/product/create-product`, data)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          setLoading(false);
          handleClose();
          const {
            _id = "",
            sku = "",
            code = "",
            title = "",
            primaryImageUrl = "",
            size = "",
            isActive = true,
            supplier = "",
            available = "",
            color = "",
            brand = "",
            price = "",
          } = result?.data || {};
          const newData = {
            _id: _id,
            sku: sku,
            code: code,
            title: title,
            primaryImageUrl: primaryImageUrl,
            size: size,
            isActive: isActive,
            supplier: supplier,
            available: available,
            color: color,
            brand: brand,
            price: price,
          };
          gridApi.applyTransaction({
            add: [newData],
            addIndex: 0,
          });
        } else {
          setLoading(false);
          toast.error("Failed to Add Product");
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to Add Product");
        console.error(error);
      });
  };

  const prepareEdit = (id) => {
    axios
      .get(`${nodeAPIUrl}/product/get-product-by-id/${id}`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          const {
            sku = "",
            code = "",
            title = "",
            primaryImageUrl = "",
            size = "",
            isActive = "",
            supplier = "",
            available = "",
            color = "",
            brand = "",
            price = "",
          } = result?.data[0] || {};

          setProduct({
            sku: sku,
            code: code,
            title: title,
            primaryImageUrl: primaryImageUrl,
            size: size,
            isActive: Boolean(isActive) || true,
            supplier: supplier,
            available: available,
            color: color,
            brand: brand,
            price: price,
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleUpdate = (data) => {
    setLoading(true);
    axios
      .put(
        `${nodeAPIUrl}/product/edit-product/${productModal?.productId}`,
        data
      )
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          setLoading(false);
          handleClose();
          const {
            _id = "",
            sku = "",
            code = "",
            title = "",
            primaryImageUrl = "",
            size = "",
            isActive = "",
            supplier = "",
            available = "",
            color = "",
            brand = "",
            price = "",
          } = result?.data || {};

          const rowNode = gridApi.getRowNode(_id);

          const newData = {
            _id: _id,
            sku: sku,
            code: code,
            title: title,
            primaryImageUrl: primaryImageUrl,
            size: size,
            isActive: Boolean(isActive) || true,
            supplier: supplier,
            available: available,
            color: color,
            brand: brand,
            price: price,
          };
          rowNode.updateData(newData);
          gridApi.flashCells({ rowNodes: [rowNode] });
          toast.success("Product Updated Successfully");
        } else {
          setLoading(false);
          toast.error("Failed to Update Product");
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to Update Product");
        console.error(error);
      });
  };

  const handleDelete = (id) => {
    setLoading(true);
    axios
      .delete(`${nodeAPIUrl}/product/delete-product/${id}`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          setLoading(false);
          handleClose();
          const {
            _id = "",
            // sku = "",
          } = result?.data || {};
          const rowNode = gridApi.getRowNode(_id);
          const { data = {} } = rowNode || {};
          if (data) {
            gridApi.applyTransaction({ remove: [data] });
          } else {
            console.error("RowNode not found for _id:", _id);
          }
          toast.success("Product Deleted Successfully");
        } else {
          setLoading(false);
          toast.error("Failed to Delete Product");
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to Delete Product");
        console.error(error);
      });
  };

  const getAllProducts = () => {
    if (gridApi && gridApi?.showLoadingOverlay) gridApi.showLoadingOverlay();
    axios
      .get(`${nodeAPIUrl}/product/get-all-product`)
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

  const getRowId = useMemo(() => {
    return (params) => {
      return params?.data?._id;
    };
  }, []);

  const handleSearch = (e) => {
    const {
      target: { value = "" },
    } = e;
    setSearchVal("");
    gridApi.setQuickFilter(value);
    setSearchVal(value);
  };

  useEffect(() => {
    if (gridApi) {
      getAllProducts();
    }
    // eslint-disable-next-line
  }, [gridApi]);

  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-4">
        <h4 className="text-lg font-semibold">Products List</h4>

        <div className="flex items-center gap-2">
          <TextField
            size="small"
            label="Search"
            value={searchValue}
            onChange={handleSearch}
            variant="outlined"
          />
          <Button
            onClick={createMode}
            size="small"
            color="success"
            variant="contained"
            className="px-2"
          >
            Add New
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={getAllProducts}
          >
            <RefreshIcon />
          </Button>
        </div>
      </div>
      <div className="ag-theme-quartz h-[550px] p-4">
        <AgGridReact
          ref={gridApi}
          rowData={productList}
          rowSelection="single"
          defaultColDef={defaultColDef}
          columnDefs={colDefs}
          onGridReady={onGridReady}
          suppressCopyRowsToClipboard
          getRowId={getRowId}
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={false}
        />
      </div>
      <Dialog open={productModal?.open} onClose={handleClose}>
        <DialogTitle>{`${productModal.mode} Product`}</DialogTitle>
        <DialogContent>
          {productModal?.mode === "Delete" ? (
            <div>
              <p>Are you sure want to delete the product?</p>
            </div>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  size="small"
                  required
                  margin="dense"
                  name="title"
                  value={product?.title}
                  label="Title"
                  type="text"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  size="small"
                  required
                  margin="dense"
                  name="sku"
                  value={product?.sku}
                  label="Sku"
                  type="text"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  size="small"
                  required
                  margin="dense"
                  name="code"
                  value={product?.code}
                  label="Code"
                  type="text"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  size="small"
                  // required
                  margin="dense"
                  name="size"
                  value={product?.size}
                  label="Size"
                  type="number"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  size="small"
                  // required
                  margin="dense"
                  name="color"
                  value={product?.color}
                  label="Color"
                  type="text"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  size="small"
                  // required
                  margin="dense"
                  name="price"
                  value={product?.price}
                  label="Price"
                  type="number"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  size="small"
                  // required
                  margin="dense"
                  name="brand"
                  value={product?.brand}
                  label="Brand"
                  type="text"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  size="small"
                  // required
                  margin="dense"
                  name="supplier"
                  value={product?.supplier}
                  label="supplier"
                  disabled
                  type="text"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  required
                  control={
                    <Switch
                      checked={product?.isActive}
                      name="isActive"
                      value={product?.isActive}
                      onChange={handleChange}
                    />
                  }
                  label="Active Status"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions className="m-4">
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            type="button"
            variant="contained"
            onClick={handleOk}
          >
            {loading ? (
              <BeatLoader color="white" style={{ height: "100%" }} size={8} />
            ) : productModal?.mode === "Delete" ? (
              `Delete`
            ) : productModal?.mode === "Edit" ? (
              `Update`
            ) : (
              `Save`
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default Products;
