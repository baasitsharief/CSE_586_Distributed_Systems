import React, { Component } from "react";
import { DataGrid } from "@mui/x-data-grid";
import api from "../Api.js";

import styled from "styled-components";

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
      this.setState({
        posts: posts.data,
        isLoading: false,
      });
    });
  };

  render() {
    const { posts, isLoading } = this.state;
    console.log("PostsList -> render -> posts", posts);

    const columns = [
      {
        headerName: "Title",
        field: "title",
        width: 200,
      },
      {
        headerName: "Author",
        field: "author",
        width: 200,
      },
      {
        headerName: "Description",
        field: "description",
        width: 400,
      },
    ];

    let showTable = true;
    if (!posts.length) {
      showTable = false;
    }

    return (
      <Wrapper style={{ height: "800px", width: "100%" }}>
        {console.log(posts.data)}
        <DataGrid
          rows={posts.data}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 15, 20]}
          checkboxSelection
        />
      </Wrapper>
    );
  }
}

export default PostsList;
