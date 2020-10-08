import React, { useState, useEffect } from 'react';
import './App.css';
import { forwardRef } from 'react';
import Avatar from 'react-avatar';
import Grid from '@material-ui/core/Grid'

import MaterialTable, { MTableToolbar } from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import axios from 'axios'
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined'
import moment from 'moment'; 


const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};
const BASE_URL = "https://sp-app-backend.herokuapp.com/api"
const api = axios.create({
  baseURL: BASE_URL
})
var tableRef = React.createRef();

function App() {
  var columns = [
    {title: "id", field: "id", hidden: true},
    {title: "Serial Number", field: "serialNumber"},
    {title: "Brand", field: "brand"},
    {title: "Model", field: "model"},
    {title: "Status", field: "status", lookup: { 'OLD': 'Old', 'UNUSED': 'Unused', 'SOLD':'Sold' },},
    {title: "Bought", field: "bought", type: 'date'}
  ]

  const [data, setData] = useState([]);
  const [iserror, setIserror] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])
  const [searchColumns, setSearchColumns] = useState(["serialNumber", "brand"]);
  const [deletedColumns, setSelectedDeletedColumns] = useState([]);
  const selectedSearchColumns = data[0] && Object.keys(data[0]);
  const selectedDeletedColumns = ['Unused', 'Old', 'Sold']
  const [query, setQuery] = useState("")
  

  useEffect(() => { 
    api.get("/appliances")
        .then(res => {               
            setData(res.data.content)
         })
         .catch(error=>{
             console.log("Error")
         })
  }, [])

  const validate = (newData) =>{
    let errorList = []
    if(newData.serialNumber === "" || newData.serialNumber == undefined){
      errorList.push("Please enter serial number")
    }
    if(newData.brand === "" || newData.brand == undefined){
      errorList.push("Please enter brand")
    }
    if(newData.model === "" || newData.model == undefined){
      errorList.push("Please enter a valid model")
    }
    return errorList
  }

  const handleRowUpdate = (newData, oldData, resolve) => {
    let errorList = validate(newData)

    if(errorList.length < 1){
      api.put("/appliances/"+newData.id, newData)
      .then(res => {
        const dataUpdate = [...data];
        const index = oldData.tableData.id;
        dataUpdate[index] = newData;
        setData([...dataUpdate]);
        resolve()
        setIserror(false)
        setErrorMessages([])
      })
      .catch(error => {
        setErrorMessages(["Update failed! Server error"])
        setIserror(true)
        resolve()
        
      })
    }else{
      setErrorMessages(errorList)
      setIserror(true)
      resolve()
    }
  }

  const handleRowAdd = (newData, resolve) => {
    let errorList = validate(newData)
    if(errorList.length < 1){
      api.post("/appliances", newData)
      .then(res => {
        let dataToAdd = [...data];
        dataToAdd.push(newData);
        setData(dataToAdd);
        resolve()
        setErrorMessages([])
        setIserror(false)
      })
      .catch(error => {
      		if (error.response && error.response.data) {
      	 	setErrorMessages([error.response.data.message])
 		 }
        setIserror(true)
        resolve()
      })
    }else{
      setErrorMessages(errorList)
      setIserror(true)
      resolve()
    }
  }

  const handleRowDelete = (oldData, resolve) => {
    api.delete("/appliances/"+oldData.id)
      .then(res => {
        const dataDelete = [...data];
        const index = oldData.tableData.id;
        dataDelete.splice(index, 1);
        setData([...dataDelete]);
        resolve()
      })
      .catch(error => {
        setErrorMessages(["Delete failed! Server error"])
        setIserror(true)
        resolve()
      })
  }

  const buildSearchQueryString = (query)=>{
    let searchParams = ''
    let url = ''
    if(query.filters.length> 0 ){
      searchParams = 'q='
      query.filters.forEach(element => {
        if(element.value != ''){
          console.log("element.value")
          console.log(element.value)

          if(Array.isArray(element.value)){
            searchParams = searchParams + element.column.field +'=in=(' + element.value+ ");"
          }else{
            if(element.column.field === 'bought'){
              searchParams = searchParams + element.column.field +'==' + moment(element.value).format('YYYY-MM-DD')+ ";"
            }else{
              searchParams = searchParams + element.column.field +'==' + element.value + "*;"
            }
          }
        }
      })
      searchParams = searchParams.slice(0, -1)
      url = '?' + searchParams +  '&size=' + query.pageSize + '&page=' + query.page
    }else{
       url = '?' + 'size=' + query.pageSize + '&page=' + query.page
    }
    return url;
  }

  return (
    <div className="App">
      <Grid container spacing={1}>
          <Grid item xs={2}></Grid>
          <Grid item xs={8}>
          <div>
            {iserror && 
              <Alert severity="error">
                  {errorMessages.map((msg, i) => {
                      return <div key={i}>{msg}</div>
                  })}
              </Alert>
            }       
          </div>

            <MaterialTable
              title="Household Appliances"
              columns={columns}
			        options={{
                search: false,
  		          actionsColumnIndex: -1,
  		          filtering: true,
  		          headerStyle: {
                   backgroundColor: '#01579b',
                   color: '#FFF',
                   fontSize:16,
                   rowStyle: { "&:hover": {backgroundColor: "#039be5"}}
                }
	            }}
              tableRef={tableRef}
      			  components={{
              Toolbar: props => (
                <div style={{padding: '5px 10px', backgroundColor: '#e3f3ff'}}>
                  
                  <MTableToolbar {...props} />
                  
                  <div style={{display: '-webkit-box', marginBottom: '5px'}} item xs={3}>
                  
                  <Button style={{marginRight: '8px'}} size="small" variant="outlined" onClick={() => { 
                      let status = deletedColumns.map(name => name.toUpperCase())
                        api.delete("/appliances?status="+ status)
                      .then(res => {
                        tableRef.current.onQueryChange();
                      })
                      .catch(error => {
                        console.log(error)
                        setErrorMessages(["Delete failed! Server error"])
                        setIserror(true)
                      })
                    }}>
                    <DeleteOutlinedIcon />Delete By Status
                  </Button>

                  {selectedDeletedColumns &&
                    selectedDeletedColumns.filter(column => column != 'id').map((column) => (
                      <label>
                        <input
                          type="checkbox" m={2}
                          checked={deletedColumns.includes(column)}
                          onChange={(e) => {
                            const checked = deletedColumns.includes(column);
                            setSelectedDeletedColumns((prev) =>
                              checked
                                ? prev.filter((sc) => sc !== column)
                                : [...prev, column]
                            );
                          }}
                        />
                        {column}
                      </label>
                    ))}     
                  </div>  

                </div>
              ),
            }}        
			      data={query => new Promise((resolve, reject) => {
			        	let searchEndPoint = BASE_URL + '/appliances' + buildSearchQueryString(query)
			          fetch(searchEndPoint)
			            .then(response => response.json())
			            .then(result => {
			              resolve({
			                data: result.content,
			                page: query.page,
			                totalCount: result.totalElements
			              })
			            })
			        })
			      }
            icons={tableIcons}
            editable={{
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve) => {
                    handleRowUpdate(newData, oldData, resolve);
                }),
              onRowAdd: (newData) =>
                new Promise((resolve) => {
                  handleRowAdd(newData, resolve)
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve) => {
                  handleRowDelete(oldData, resolve)
                }),
            }}
            />
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
    </div>
  );
}
export default App;