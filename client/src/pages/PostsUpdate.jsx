import React, { Component } from "react";
import api from "../Api.js";

import styled from "styled-components";

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

class PostsUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.match.params.id,
      title: "",
      author: "",
      description: "",
    };
  }

  handleUpdateInputTitle = async (event) => {
    const title = event.target.value;
    this.setState({ title });
  };

  handleUpdateInputAuthor = async (event) => {
    const author = event.target.value;
    this.setState({ author });
  };

  handleUpdateInputDescription = async (event) => {
    const description = event.target.value;
    this.setState({ description });
  };

  handleUpdatePost = async () => {
    const { id } = this.state;
    const post = await api.getPostById(id);

    this.setState({
      title: post.data.data.title,
      author: post.data.data.author,
      description: post.data.data.description,
    });
  };

  render() {
    const { title, author, description } = this.state;
    return (
      <Wrapper>
        <Title>Update Movie</Title>

        <Label>Title: </Label>
        <InputText
          type="text"
          value={title}
          onChange={this.handleUpdateInputTitle}
        />

        <Label>Author: </Label>
        <InputText
          type="text"
          value={author}
          onChange={this.handleUpdateInputAuthor}
        />

        <Label>Description: </Label>
        <InputText
          type="text"
          value={description}
          onChange={this.handleUpdateInputDescription}
        />

        <Button onClick={this.handleUpdatePost}>Update</Button>
        <CancelButton href={"/posts/list"}>Cancel</CancelButton>
      </Wrapper>
    );
  }
}

export default PostsUpdate;
