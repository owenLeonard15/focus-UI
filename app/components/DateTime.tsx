const dayOfWeek = (day: number) => {
    switch (day) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      default:
        return "Invalid day";
    }
  }
  
  const getMonth = (month: number) => {
    switch (month) {
      case 0:
        return "January";
      case 1:
        return "February";
      case 2:
        return "March";
      case 3:
        return "April";
      case 4:
        return "May";
      case 5:
        return "June";
      case 6:
        return "July";
      case 7:
        return "August";
      case 8:
        return "September";
      case 9:
        return "October";
      case 10:
        return "November";
      case 11:
        return "December";
      default:
        return "Invalid month";
    }
  }

  export default function DateTime() {
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();

    return (
        <div className="datetime">
            <h4 className="date">{dayOfWeek(currentDate.getDay())} {getMonth(currentDate.getMonth())} {currentDate.getDate()}, {currentDate.getFullYear()}</h4>
            {/* drop seconds from the time and add AM or PM */}
            <h3 className="time"> {currentTime.slice(0, currentTime.length - 6)} {currentTime.slice(-2)}</h3>
        </div>
    )
  }
