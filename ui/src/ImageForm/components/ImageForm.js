import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import './ImageForm.css';

class ImageForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            imageList: [],
            selectedValue: '',
        }
    }

    updateConfigmap() {
        fetch('/api/user/'+this.props.username+'/configmap', {method:'GET'})
            .then(response => {
                if (response.ok) {
                    return response.json();
                } 
                else {
                    throw new Error('Failed to fetch user cm');
                }
            })
            .then(data => {
                this.setState({selectedValue: data['last_selected_image']})
            }) 
    }

    updateImages(){
        fetch('/api/images', {method: 'GET'})
            .then(response => {
                if (response.ok) {
                    return response.json();
                } 
                else {
                    throw new Error('Unknown error.');
                }
            })
            .then(data => {
                this.setState({imageList: data});
            })
    }

    componentDidMount() {
        this.updateConfigmap()
        this.updateImages()
    }

    componentDidUpdate(){
        this.updateImages()
    }



    postChange(event) {
        var json = JSON.stringify({last_selected_image: event.target.text})
        //var json_string = '{"last_selected_image":"'+event.target.text+'"}'
        fetch('/api/user/'+this.props.username+'/configmap', {method: 'POST', body: json, headers:{'Content-Type': 'application/json',}})  //TODO: Make username a variable!
        console.log("Sent chosen image:", json); // Event target value is current (using this.state.selectedValue returned the previous value)
        this.updateConfigmap()
    }

    DropdownValue() {
        if (this.state.selectedValue != null && this.state.selectedValue != '') {
            return this.state.selectedValue
        }
        else {
            if(this.state.imageList.length != 0) {
                return this.state.imageList[0]
            }
            else {
                return "No images available"
            }
        }
    }

    CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <a
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
          }}
        >
            <Button className="ImageForm" variant="light">
                <div className="ImageGrid">
                    {children}
                    <p className="DropdownRight">&#x25bc;</p>
                </div>
            </Button>
        </a>
      ));


    render () {
        return (
            <div>
                <Form>
                    <FormGroup>
                        <Dropdown as={ButtonGroup}>
                            <Dropdown.Toggle as={this.CustomToggle} id="dropdown-image">{this.DropdownValue()}</Dropdown.Toggle>
                            <Dropdown.Menu className="ImageMenu">
                                {this.state.imageList.map((value, index) => (
                                            <Dropdown.Item onClick={(e) => this.postChange(e)} eventKey={index.toString()}>{value}</Dropdown.Item>
                                    )
                                    )}
                            </Dropdown.Menu>
                        </Dropdown>{' '}
                    </FormGroup>
                </Form>
            </div>
        )
    }
}

export default ImageForm