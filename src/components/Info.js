
const Info = ({ account, accountBalance }) => {
  return (
    <div className="my3">
      <p><strong>Account:</strong> {account}</p>
      <p><strong>Token Balance:</strong> {accountBalance}</p>
    </div>
  )
}

export default Info
