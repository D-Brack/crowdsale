import ProgressBar from 'react-bootstrap/ProgressBar'

const Progress = ({ tokensSold, totalSupply }) => {
  const percent = tokensSold / totalSupply * 100

  return (
    <div className='my-4'>
      <ProgressBar now={percent} label={`${percent}%`} />
      <p className='text-center my-3'>{tokensSold} / {totalSupply}<strong> Tokens Sold</strong></p>
    </div>
  )
}

export default Progress
