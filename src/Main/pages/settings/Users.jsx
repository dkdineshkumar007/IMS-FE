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
import BeatLoader from "react-spinners/BeatLoader";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import { MenuItem } from "@mui/material";

const nodeAPIUrl = `http://localhost:5000/api/v1`;

const Users = () => {
  const [gridApi, setGridApi] = useState(null);
  const [userList, setUserList] = useState([]);
  const [userModal, setUserModal] = useState({
    open: false,
    mode: "Create",
    userId: "",
  });
  const [searchValue, setSearchVal] = useState("");

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    role: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const roles = [
    {
      value: "General",
      label: "General",
    },
    {
      value: "Admin",
      label: "Admin",
    },
    {
      value: "SuperAdmin",
      label: "SuperAdmin",
    },
  ];

  const defaultColDef = useState({
    editable: false,
    sortable: true,
    filter: false,
    selectable: false,
  });

  const colDefs = [
    {
      field: "firstName",
      headerName: "First Name",
    },
    { field: "lastName", headerName: "Last Name", width: 350 },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
    },
    { field: "phone", headerName: "Phone No.", flex: 1 },
    { field: "email", headerName: "Email Address", flex: 1 },
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
    setUserModal((prev) => ({
      ...prev,
      open: false,
    }));
    clearFields();
  };

  const editMode = (id) => {
    setUserModal((prev) => ({
      ...prev,
      open: true,
      mode: "Edit",
      userId: id || "",
    }));
    prepareEdit(id);
  };

  const createMode = () => {
    clearFields();
    setUserModal((prev) => ({
      ...prev,
      open: true,
      mode: "Create",
      productId: "",
    }));
  };

  const deleteMode = (id) => {
    clearFields();
    setUserModal((prev) => ({
      ...prev,
      open: true,
      mode: "Delete",
      productId: id || "",
    }));
  };

  const clearFields = () => {
    setUser({
      firstName: "",
      lastName: "",
      role: "",
      phone: "",
      email: "",
      password: "",
    });
  };

  const handleChange = (event) => {
    const { name = "", value = "", checked = "" } = event?.target || {};
    if (name === "isActive") {
      setUser((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOk = () => {
    const data = {
      firstName: user?.firstName?.trim() || "",
      lastName: user?.lastName?.trim() || "",
      role: user?.role?.trim() || "",
      phone: user?.phone?.trim() || "",
      email: user?.email,
      password: user?.password.trim() || "",
    };
    if (userModal?.mode === "Create" || userModal?.mode === "Edit") {
      if (
        !data.firstName ||
        !data.lastName ||
        !data.email ||
        !data.password ||
        !data?.role
      ) {
        toast.error(`Please Fill the required fields.`);
        return console.error("Validation failed: Required Fields missing!");
      }
    }

    if (userModal?.mode === "Create") {
      handleCreate(data);
    } else if (userModal?.mode === "Edit") {
      handleUpdate(data);
    } else {
      const { userId = "" } = userModal || {};
      handleDelete(userId);
    }
  };

  const handleCreate = (data) => {
    setLoading(true);
    axios
      .post(`${nodeAPIUrl}/user/create-user`, data)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          setLoading(false);
          handleClose();
          const {
            _id = "",
            firstName = "",
            lastName = "",
            role = "",
            phone = "",
            email = "",
          } = result?.data || {};
          const newData = {
            _id: _id,
            firstName: firstName,
            lastName: lastName,
            role: role,
            phone: phone,
            email: email,
          };
          gridApi.applyTransaction({
            add: [newData],
            addIndex: 0,
          });
        } else {
          setLoading(false);
          toast.error("Failed to Add User");
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to Add User");
        console.error(error);
      });
  };

  const prepareEdit = (id) => {
    axios
      .get(`${nodeAPIUrl}/user/get-user-by-id/${id}`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          const {
            firstName = "",
            lastName = "",
            role = "",
            phone = "",
            email = "",
            password = "",
          } = result?.data || {};

          setUser({
            firstName: firstName,
            lastName: lastName,
            role: role,
            phone: phone,
            email: email,
            password: password,
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
      .put(`${nodeAPIUrl}/user/edit-user/${userModal?.userId}`, data)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          setLoading(false);
          handleClose();
          const {
            _id = "",
            firstName = "",
            lastName = "",
            role = "",
            phone = "",
            email = "",
            password = "",
          } = result?.data || {};

          const rowNode = gridApi.getRowNode(_id);

          const newData = {
            _id: _id,
            firstName: firstName,
            lastName: lastName,
            role: role,
            phone: phone,
            email: email,
            password: password,
          };
          rowNode.updateData(newData);
          gridApi.flashCells({ rowNodes: [rowNode] });
          toast.success("User Updated Successfully");
        } else {
          setLoading(false);
          toast.error("Failed to Update User");
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to Update User");
        console.error(error);
      });
  };

  const handleDelete = (id) => {
    setLoading(true);
    axios
      .delete(`${nodeAPIUrl}/user/delete-user/${id}`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          setLoading(false);
          handleClose();
          const { _id = "" } = result?.data || {};
          const rowNode = gridApi.getRowNode(_id);
          const { data = {} } = rowNode || {};
          if (data) {
            gridApi.applyTransaction({ remove: [data] });
          } else {
            console.error("RowNode not found for _id:", _id);
          }
          toast.success("User Deleted Successfully");
        } else {
          setLoading(false);
          toast.error("Failed to Delete User");
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to Delete User");
        console.error(error);
      });
  };

  const getAllUsers = () => {
    if (gridApi && gridApi?.showLoadingOverlay) gridApi.showLoadingOverlay();
    axios
      .get(`${nodeAPIUrl}/user/get-all-users`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data && result?.data?.length) {
          setUserList(result?.data);
          if (gridApi && gridApi?.hideOverlay) gridApi.hideOverlay();
        } else {
          setUserList([]);
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
      getAllUsers();
    }
    // eslint-disable-next-line
  }, [gridApi]);

  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-4">
        <h4 className="text-lg font-semibold">Users List</h4>

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
            onClick={getAllUsers}
          >
            <RefreshIcon />
          </Button>
        </div>
      </div>
      <div className="ag-theme-quartz h-[550px] p-4">
        <AgGridReact
          ref={gridApi}
          rowData={userList}
          rowSelection="single"
          defaultColDef={defaultColDef}
          columnDefs={colDefs}
          onGridReady={onGridReady}
          getRowId={getRowId}
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={false}
        />
      </div>
      <Dialog open={userModal?.open} onClose={handleClose}>
        <DialogTitle>{`${userModal?.mode} User`}</DialogTitle>
        <DialogContent>
          {userModal?.mode === "Delete" ? (
            <div>
              <p>Are you sure want to delete the product?</p>
            </div>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  size="small"
                  required
                  margin="dense"
                  name="firstName"
                  value={user?.firstName}
                  label="First Name"
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
                  name="lastName"
                  value={user?.lastName}
                  label="Last Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="outlined-select-currency"
                  select
                  sx={{ width: "100%" }}
                  size="small"
                  label="User Role"
                  name="role"
                  onChange={handleChange}
                  value={user?.role}
                >
                  {roles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  size="small"
                  margin="dense"
                  name="phone"
                  value={user?.phone}
                  label="Phone"
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
                  name="email"
                  value={user?.email}
                  label="Email"
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
                  name="password"
                  value={user?.password}
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions className="m-4">
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            type="button"
            variant="contained"
            onClick={handleOk}
            color="success"
          >
            {loading ? (
              <BeatLoader color="white" style={{ height: "100%" }} size={8} />
            ) : userModal?.mode === "Delete" ? (
              `Delete`
            ) : userModal?.mode === "Edit" ? (
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

export default Users;
