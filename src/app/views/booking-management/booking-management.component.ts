import { Component, OnInit } from '@angular/core';
import { BookingServiceService } from './../../services/booking-service.service';
interface Meeting {
  username: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  agenda: string;
}

interface RoomStatus extends Meeting {
  status: string;
}

@Component({
  selector: 'app-booking-management',
  templateUrl: './booking-management.component.html',
  styleUrls: ['./booking-management.component.css'],
})
export class BookingManagementComponent implements OnInit {
  username: '';
  room: any = 'null';
  date: any;
  startTime: any;
  endTime: any;
  agenda: any;
  viewRoom: any = '';
  deleteRoom: any;
  deleteDate: any;
  deleteStartTime: any;
  roomStatuses: RoomStatus[] | any;

  filteredRoomStatuses: { [room: string]: RoomStatus[] } = {};
  bookingRooms = [];
  todayDate: any;
  public meetingRooms: { [room: string]: Meeting[] };
  rooms = [
    { id: 1, name: 'Room 1' },
    { id: 2, name: 'Room 2' },
    { id: 3, name: 'Room 3' },
    { id: 4, name: 'Room 4' },
    { id: 5, name: 'Room 5' },
    { id: 6, name: 'Room 6' },
    { id: 7, name: 'Room 7' },
    { id: 8, name: 'Room 8' },
    { id: 9, name: 'Room 9' },
    { id: 10, name: 'Room 10' },
  ];
  currentDate: string = new Date().toISOString().slice(0, 10);
  constructor(private meetingRoomManager: BookingServiceService) {
    this.meetingRooms = {};
    this.roomStatuses = [];
    this.filteredRoomStatuses = this.roomStatuses;
  }
  ngOnInit(): void {}

  onSubmit(bookForm: any) {
    const status = this.meetingRoomManager.bookMeeting(
      this.username,
      this.room,
      this.date,
      this.startTime,
      this.endTime,
      this.agenda
    );

    let statusText = '';
    let username = '';

    if (status === 'success') {
      statusText = 'Booked';
    } else if (status === 'conflict') {
      statusText = 'In-Use';
      username = this.getUsernameForRoom(this.room);
    } else {
      statusText = 'Available';
    }

    this.startTime = new Date(`${this.currentDate}T${this.startTime}`);
    this.endTime = new Date(`${this.currentDate}T${this.endTime}`);
    // if (this.startTime >= this.endTime) {
    //   alert('The "Time To" should be later than "Time From".');
    //   return;
    // }

    const bookingDuration = Math.abs(
      this.startTime.getTime() - this.endTime.getTime()
    );
    const minDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

    if (bookingDuration < minDuration) {
      alert('The minimum booking duration should be 30 minutes.');
      return;
    }

    const newMeeting: RoomStatus = {
      username: this.username,
      room: this.room,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      agenda: this.agenda,
      status: statusText,
    };
    // if (!this.meetingRooms[room]) {
    //       this.meetingRooms[room] = [];
    //     }
    this.roomStatuses.push(newMeeting);
    this.roomStatuses[this.room] = this.roomStatuses[this.room] || [];
    this.roomStatuses[this.room].push(newMeeting);
    this.filteredRoomStatuses = this.roomStatuses;
    this.clearBookingInputs();
  }

  clearBookingInputs(): void {
    this.username = '';
    this.room = null;
    this.date = '';
    this.startTime = '';
    this.endTime = '';
    this.agenda = '';
  }

  getUsernameForRoom(room: string): string {
    const meetings = this.roomStatuses[room] || [];
    if (meetings.length > 0) {
      return meetings[0].username;
    }
    return '';
  }

  filterMeetingRooms() {
    if (this.viewRoom) {
      this.filteredRoomStatuses = {
        [this.viewRoom]: this.roomStatuses[this.viewRoom] || [],
      };
      console.log(this.viewRoom);
    } else {
      this.filteredRoomStatuses = this.roomStatuses;
      console.log(this.filteredRoomStatuses);
    }
  }

  viewMeetingsRooms(room: string) {
    this.meetingRooms[room] || [];
  }

  deleteMeeting(room: string, date: string, startTime: string) {
    const meetings = this.roomStatuses[room];
    if (meetings) {
      const index = meetings.findIndex(
        (meeting: any) =>
          meeting.date === date && meeting.startTime === startTime
      );
      if (index !== -1) {
        meetings.splice(index, 1);
      }
    }
    this.filterMeetingRooms();
  }

  getCurrentStatus() {
    const status = this.meetingRoomManager.getCurrentStatus();
  }

  restrictToMondayFriday(event: any) {
    const selectedDate = new Date(event.target.value);
    const dayOfWeek = selectedDate.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      event.target.value = '';
      alert('Please select a date between Monday to Friday.');
    }
  }

  validateTime() {
    const selectedTime = this.startTime.split(':') || this.endTime.split(':');
    const hour = Number(selectedTime[0]);
    const minute = Number(selectedTime[1]);

    if (hour < 9 || hour > 18 || (hour === 18 && minute > 0)) {
      this.startTime = '';
      this.endTime = '';
      alert('Please select a time between 9:00AM and 6:00PM.');
    }
  }
}
