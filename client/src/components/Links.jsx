import React, { Component } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Collapse = styled.div.attrs({
  className: "collapse navbar-collapse",
})``;

const List = styled.div.attrs({
  className: "navbar-nav mr-auto",
})``;

const Item = styled.div.attrs({
  className: "collapse navbar-collapse",
})``;

class Links extends Component {
  render() {
    return (
      <React.Fragment>
        <Link to="/" className="navbar-brand">
          Post Feed
        </Link>
        <Collapse>
          <List>
            <Item>
              <Link to="/posts/list" className="nav-link">
                All Posts
              </Link>
            </Item>
            <Item>
              <Link to="/posts/create" className="nav-link">
                Create Post
              </Link>
            </Item>
          </List>
        </Collapse>
      </React.Fragment>
    );
  }
}

export default Links;
