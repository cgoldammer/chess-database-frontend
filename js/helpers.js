
export const objectIsEmpty = (obj) => Object.keys(obj).length === 0 && obj.constructor === Object 

export const avg = vals => {
  var total = 0;
  for(var i = 0; i < vals.length; i++) {
      total += vals[i];
  }
  return (total / vals.length);
}

export const playerName = player => player.lastName + (player.firstName.length == 0 ? '' : ', ' + player.firstName)
