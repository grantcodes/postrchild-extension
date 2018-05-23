import React, { Component, Fragment } from "react";
import {
  Box,
  Button,
  ButtonOutline,
  Checkbox,
  Group,
  Label,
  Input,
  Textarea,
  Switch,
  Select
} from "rebass";

class Mf2Editor extends Component {
  constructor(props) {
    super(props);
    this.state = { ...props.properties };

    this.renderProperty = this.renderProperty.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changeMf2 = this.changeMf2.bind(this);
  }

  componentDidMount() {}

  renderProperty(props) {
    if (this.props.hiddenProperties.indexOf(props.name) > -1) {
      return null;
    }
    return (
      <Box mb={3}>
        <Label color="black" htmlFor={"mf2_" + props.name}>
          {props.label}
        </Label>
        {props.children}
      </Box>
    );
  }

  handleChange(name) {
    return e => {
      this.state[name] = e.target.value;
      this.setState({ [name]: [e.target.value] }, this.changeMf2);
    };
  }

  changeMf2() {
    let mf2 = {
      type: "h-entry",
      properties: {}
    };
    Object.keys(this.state).forEach(key => {
      let value = this.state[key];
      if (value) {
        if (!Array.isArray(value)) {
          value = [value];
        }
        if (value[0]) {
          mf2.properties[key] = value;
        }
      }
    });
    this.props.onChange(mf2);
  }

  render() {
    const Property = this.renderProperty;
    const propertyValue = name => (this.state[name] ? this.state[name][0] : "");

    return (
      <form>
        <Property name="name" label="Name">
          <Input
            id="mf2_name"
            value={propertyValue("name")}
            onChange={this.handleChange("name")}
          />
        </Property>

        <Property name="summary" label="Summary">
          <Input
            id="mf2_summary"
            value={propertyValue("summary")}
            onChange={this.handleChange("summary")}
          />
        </Property>

        <Property name="content" label="Content">
          <Textarea
            id="mf2_content"
            value={
              this.state.content &&
              this.state.content[0] &&
              this.state.content[0].value
                ? this.state.content[0].value
                : propertyValue("content")
            }
            onChange={this.handleChange("content")}
          />
        </Property>

        <Property name="category" label="Tags (comma separated)">
          <Input
            id="mf2_category"
            value={(this.state.category || []).join(",")}
            onChange={e => {
              this.setState(
                {
                  category: e.target.value.split(",").map(cat => cat.trim())
                },
                this.changeMf2
              );
            }}
          />
        </Property>

        <Property name="in-reply-to" label="In Reply To">
          <Input
            type="url"
            id="mf2_in-reply-to"
            value={propertyValue("in-reply-to")}
            onChange={this.handleChange("in-reply-to")}
          />
        </Property>

        <Property name="like-of" label="Like Of">
          <Input
            type="url"
            id="mf2_like-of"
            value={propertyValue("like-of")}
            onChange={this.handleChange("like-of")}
          />
        </Property>

        <Property name="bookmark-of" label="Bookmark Of">
          <Input
            type="url"
            id="mf2_bookmark-of"
            value={propertyValue("bookmark-of")}
            onChange={this.handleChange("bookmark-of")}
          />
        </Property>

        <Property name="featured" label="Featured">
          <Input
            id="mf2_featured"
            type="file"
            value={propertyValue("featured")}
            onChange={this.handleChange("featured")}
          />
        </Property>

        {/* <Property name="photo" label="Photo">
          {/* TODO: this should support multiple photos */}
        {/*<Input
            id="mf2_photo"
            type="file"
            value={this.state.photo}
            onChange={this.handleChange("photo")}
          />
        </Property> */}

        {/* <Property name="location" label="Location">
          <Button>Grab Location</Button>
        </Property> */}

        <Property name="visibility" label="Visibility">
          <Select
            id="mf2_visibility"
            value={propertyValue("visibility")}
            onChange={this.handleChange("visibility")}
          >
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="unlisted">Unlisted</option>
          </Select>
        </Property>

        <Property name="post-status" label="Draft">
          <Switch
            id="mf2_post-status"
            checked={
              this.state["post-status"] &&
              this.state["post-status"][0] == "draft"
            }
            id="mf2_visibility"
            onClick={e => {
              let status = "draft";
              if (
                this.state["post-status"] &&
                this.state["post-status"][0] == "draft"
              ) {
                status = "";
              }
              this.setState({ "post-status": [status] }, this.changeMf2);
            }}
          />
        </Property>

        {this.props.syndication.length && (
          <Property name="mp-syndicate-to" label="Syndication">
            {this.props.syndication.map(service => {
              let checked = false;
              let uid = service.uid;
              let name = service.name;
              if (service.service && service.service.name) {
                name = service.service.name;
              }
              if (
                this.state["mp-syndicate-to"] &&
                this.state["mp-syndicate-to"].indexOf(uid) > -1
              ) {
                checked = true;
              }
              return (
                <Label color="black" key={uid}>
                  <Checkbox
                    checked={checked}
                    style={{ width: 16, height: 16 }}
                    onChange={e => {
                      let selectedServices =
                        this.state["mp-syndicate-to"] || [];
                      const existingIndex = selectedServices.indexOf(uid);
                      if (existingIndex > -1) {
                        selectedServices = selectedServices.splice(
                          existingIndex,
                          1
                        );
                      } else {
                        selectedServices.push(uid);
                      }
                      this.setState(
                        {
                          "mp-syndicate-to": [...selectedServices]
                        },
                        this.changeMf2
                      );
                    }}
                  />
                  {name}
                </Label>
              );
            })}
          </Property>
        )}
      </form>
    );
  }
}

Mf2Editor.defaultProps = {
  properties: {},
  hiddenProperties: [],
  syndication: [],
  onChange: () => {}
};

export default Mf2Editor;
