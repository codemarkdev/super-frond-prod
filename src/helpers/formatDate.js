
export function formatLocalDateTime(date = new Date()) {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const formattedDate = offsetDate.toISOString().split('T')[0];
    const formattedTime = offsetDate.toISOString().split('T')[1].split('.')[0];
    return `${formattedDate} ${formattedTime}`;
  }


  