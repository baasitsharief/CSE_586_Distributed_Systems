import React, { Component } from "react";
// import ReactTable from "react-table";
import { DataGrid } from "@mui/x-data-grid";
import api from "../Api.js";

import styled from "styled-components";

// import "react-table/react-table.css";

const Wrapper = styled.div`
  padding: 0 40px 40px 40px;
`;

const Update = styled.div`
  color: #ef9b0f;
  cursor: pointer;
`;

const Delete = styled.div`
  color: #ff0000;
  cursor: pointer;
`;

class UpdatePost extends Component {
  updateUser = (event) => {
    event.preventDefault();

    window.location.href = `/posts/update/$(this.props.id)`;
  };

  render() {
    return <Update onClick={this.updateUser}>Update</Update>;
  }
}

class DeletePost extends Component {
  deleteUser = (event) => {
    event.preventDefault();

    if (
      window.confirm(
        `Do you want to delete the post ${this.props.id} permanently?`
      )
    ) {
      api.deletePostById(this.props.id);
      window.location.reload();
    }
  };

  render() {
    return <Delete onClick={this.deleteUser}>Delete</Delete>;
  }
}

class PostsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      columns: [],
      isLoading: false,
    };
  }

  componentDidMount = async () => {
    this.setState({ isLoading: true });

    await api.getAllPosts().then((posts) => {
      console.log(posts);
      this.setState({
        posts: posts.data,
        isLoading: false,
      });
    });
  };

  render() {
    const { posts, isLoading } = this.state;
    console.log("TCL: PostsList -> render -> posts", posts);

    const columns = [
      //   {
      //     headerName: "ID",
      //     field: "id",
      //     // filterable: true,
      //   },
      {
        headerName: "Title",
        field: "title",
        // filterable: true,
      },
      {
        headerName: "Author",
        field: "author",
        // filterable: true,
      },
      {
        headerName: "Description",
        field: "description",
      },
      //   {
      //     headerName: "",
      //     field: "",
      //     Cell: function (props) {
      //       return (
      //         <span>
      //           <DeletePost id={props.original._id} />
      //         </span>
      //       );
      //     },
      //   },
      //   {
      //     headerName: "",
      //     field: "",
      //     Cell: function (props) {
      //       return (
      //         <span>
      //           <UpdatePost id={props.original._id} />
      //         </span>
      //       );
      //     },
      //   },
    ];

    let showTable = true;
    if (!posts.length) {
      showTable = false;
    }

    // for (i = 0; i < posts.length; i++) {}

    return (
      <Wrapper style={{ height: "650px", width: "100%" }}>
        {console.log(posts.data)}
        <DataGrid
          rows={posts.data}
          columns={columns}
          //   getRowId={(row) => row._id}
          // loading={isLoading}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
        />
      </Wrapper>
    );
  }
}

export default PostsList;
