import React, { Component } from "react";
// import ReactTable form 'react-table'
import api from "../Api.js";

import styled from "styled-components";

// import "react-table/react-table.css";

const Title = styled.h1.attrs({
  className: "h1",
})``;

const Wrapper = styled.div.attrs({
  className: "form-group",
})`
  margin: 0 30px;
`;

const Label = styled.label`
  margin: 5px;
`;

const InputText = styled.input.attrs({
  className: "form-control",
})`
  margin: 5px;
`;

const Button = styled.button.attrs({
  className: `btn btn-primary`,
})`
  margin: 15px 15px 15px 5px;
`;

const CancelButton = styled.a.attrs({
  className: `btn btn-danger`,
})`
  margin: 15px 15px 15px 5px;
`;

class PostsInsert extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: "",
      author: "",
      description: "",
    };
  }

  handleChangeInputTitle = async (event) => {
    const title = event.target.value;
    this.setState({ title });
  };

  handleChangeInputAuthor = async (event) => {
    const author = event.target.value;
    this.setState({ author });
  };

  handleChangeInputDescription = async (event) => {
    const description = event.target.value;
    this.setState({ description });
  };

  handleIncludePost = async () => {
    const { title, author, description } = this.state;
    const payload = { title, author, description };

    await api.insertPost(payload).then((res) => {
      window.alert(`Post created successfully!`);
      this.setState({
        title: "",
        author: "",
        description: "",
      });
    });
  };

  render() {
    const { title, author, description } = this.state;
    return (
      <Wrapper>
        <Title>Create a post!</Title>

        <Label>Title: </Label>
        <InputText
          type="text"
          value={title}
          onChange={this.handleChangeInputTitle}
        />
        <Label>Author: </Label>
        <InputText
          type="text"
          value={author}
          onChange={this.handleChangeInputAuthor}
        />
        <Label>Description: </Label>
        <InputText
          type="text"
          value={description}
          onChange={this.handleChangeInputDescription}
        />

        <Button onClick={this.handleIncludePost}>Post</Button>
        <CancelButton href={"/posts/list"}>Cancel</CancelButton>
      </Wrapper>
    );
  }
}

export default PostsInsert;
