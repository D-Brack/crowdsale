import Spinner from 'react-bootstrap/Spinner'
const Loading = ({ price }) => {
  return (
    <div className='text-center my-5'>
      <Spinner animation="border" variant="info" />
      <p className='text-center'>Loading...</p>
      </div>
  )
}

export default Loading
