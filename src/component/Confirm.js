import * as React from "react"
import {
    Modal, Button
} from "react-bootstrap";

export default class ConfirmStatusChange extends React.Component {
  state = {
    open: false,
    callback: null
  }

  show = callback => event => {
    event.preventDefault()

    event = {
      ...event,
      target: { ...event.target, value: event.target.value }
    }

    this.setState({
      open: true,
      callback: () => callback(event)
    })
  }

  hide = () => this.setState({ open: false, callback: null })

  confirm = () => {
    this.state.callback();
    this.hide();
  }

  render() {
    return (
      <React.Fragment>
        {this.props.children(this.show)}

          <Modal show={this.state.open} onHide={this.hide}>
          <Modal.Header closeButton>
              <Modal.Title>{this.props.title}</Modal.Title>
              <Modal.Title>{this.props.description}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button onClick={this.hide}>Cancel</Button> &nbsp;&nbsp;&nbsp;
            <Button onClick={this.confirm}>OK</Button>
            </Modal.Body>
          </Modal>

      </React.Fragment>
    )
  }
}
