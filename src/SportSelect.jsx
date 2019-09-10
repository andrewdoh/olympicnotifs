import React, { Component } from 'react'
import Select from 'react-select'


const options = [
    { value:'1122', label: 'Artistic Swimming'},
    {value:'16', label: 'Diving'},
    {value: '31', label: 'Marathon Swimming'},
    {value: '1', label: 'Swimming'},
    {value: '38', label: 'Water Polo'},
    { value:'2', label: 'Archery'},
    { value:'3', label: 'Athletics'},
    {value: '4', label: 'Athletics (Marathon)'},
    { value:'6', label: 'Badminton'},
    { value:'1112', label: 'Baseball'},
    { value: '1113', label: 'Softball'},
    { value:'7', label:'Basketball'},
    { value:'1119', label: 'Basketball 3X3'},
    { value:'10', label: 'Canoe Slalom'},
    {value:'11', label: 'Canoe Sprint'},
    { value:'44', label: 'Closing Ceremony'},
    { value:'12', label: 'Cycling BMX'},
    {value: '1120', label: 'Cycling BMX Racing'},
    {value: '13', label: 'Cycling Mountain Bike'},
    {value: '14', label: 'Cycling Road'},
    {value: '15', label: 'Cycling Track'},
    { value: '17', label: 'Equestrian Dressage'},
    {value: '18', label: 'Equestrian Eventing'},
    {value: '19', label: 'Equestrian Jumping'},
    { value: '20', label: 'Fencing'},
    { value: '21', label: 'Football'},
    { value:'106', label: 'Golf'},
    { value: '22', label: 'Gymnastics (Artistic)'},
    {value: '23', label: 'Gymnastics (Rhythmic)'},
    {value: '24', label: 'Gymnastics (Trampoline)'},
    { value:'25', label: 'Handball'},
    { value: '26' , label: 'Hockey'},
    { value:'27', label: 'Judo'},
    { value:'1116', label: 'Karate'},
    { value: '28', label: 'Modern Pentathlon'},
    { value:'43', label: 'Opening Ceremony'},
    { value:'29', label: 'Rowing'},
    { value: '107', label: 'Rugby'},
    { value: '30', label: 'Sailing'},
    { value:'42', label: 'Shooting'},
    { value:'1117', label: 'Skateboarding'},
    { value:'1123', label: 'Sport Climbing'},
    { value:'1115', label: 'Surfing'},
    { value:'33', label: 'Table Tennis'},
    { value: '34', label: 'Takewondo'},
    { value:'35', label: 'Tennis'},
    { value: '36', label: 'Triathlon'},
    { value:'37', label: 'Volleyball'},
    {value: '8', label: 'Volleyball (Beach)'},
    { value:'39', label: 'Weightlifting' },
    { value:'1121', label: 'Wrestling'}
]

export default class SportSelect extends Component {

    state = {
        selectedOption: []
    }

    onChange = selectedOption => {
        this.setState({selectedOption})
        this.props.onChange(selectedOption)
    }
    render() {
        const { selectedOption } = this.state
        return (
            <Select
              value={selectedOption && selectedOption.length > 0 ? selectedOption: this.props.value}
              onChange={this.onChange}
              options={options}
              isMulti
              />
        )
    }
}
