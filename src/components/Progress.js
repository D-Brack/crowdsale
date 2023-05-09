import ProgressBar from 'react-bootstrap/ProgressBar'

const Progress = ({ tokensSold, totalSupply }) => {
  const percent = tokensSold / totalSupply * 100

  return (
    <div>
      <ProgressBar now={percent} label={`${percent}%`} />
      <p className='text-center'><strong>Tokens Sold: </strong> {`${tokensSold} / ${totalSupply}`}</p>
    </div>
  )
}

export default Progress
