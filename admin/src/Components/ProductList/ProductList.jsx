import React from 'react';
import './ProductList.css';
import { useEffect,useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid,GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';


const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState({});
  console.log(products);

  const handleDeleteClick = (id) => async () => {
    await fetch('http://localhost:4000/removeproduct',{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id:id})
    });
    await fetchProducts();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      editable: true,
    },
    {
      field: 'image_url',
      headerName: 'Image',
      width: 150,
      editable: true,
      renderCell: (params) => {
        console.log(params.value);
        return <img src={params.value} style={{width:50, height:50}}/>
      }
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      editable: true,
    },
    {
      field: 'old_price',
      headerName: 'Old Price',
      width: 160,
      editable: true,
      renderCell: (params) => {
        return `$${params.value}`;
      }
    },
    {
      field: 'new_price',
      headerName: 'New Price',
      width: 160,
      editable: true,
      renderCell: (params) => {
        return `$${params.value}`;
      }
    },
    {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 100,
        cellClassName: 'actions',
        getActions: ({ id }) => {
  
          return [
            <GridActionsCellItem
              icon={<DeleteIcon/>}
              label="Delete"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />
          ];
        },
      },
  ];

  async function fetchProducts(){
    return await fetch('http://localhost:4000/allproducts').then(response=>response.json()).then(products=>setProducts(products));
  }

  useEffect(()=>{
    fetchProducts();
  },[]);

  const mutateRow = (newRow)=>{
    return fetch('http://localhost:4000/updateproduct', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: newRow.id,
        name: newRow.name,
        category: newRow.category,
        old_price: newRow.old_price,
        new_price: newRow.new_price
      })
    })
  }

  const processRowUpdate = React.useCallback(
    async (newRow) => {
      console.log(newRow);
      // Make the HTTP request to save in the backend
      const response = await mutateRow(newRow);
      const data = await response.json();
      console.log(data);
      return response;
    },
    [mutateRow],
  );
  function handleProcessRowUpdateError(error){
    setError(error);
  }
  return (
    <div className='productlist-page'>
      <h1>The products list</h1>
      <div className='productlist-format-main'>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={products}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
      </div>
    </div>
  )
}

export default ProductList