import { Injectable } from '@angular/core';
interface Meeting {
  username: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  agenda: string;
}

class MeetingRoom {
  name: string;
  schedule: Meeting[];

  constructor(name: string) {
    this.name = name;
    this.schedule = [];
  }
}
@Injectable({
  providedIn: 'root',
})
export class BookingServiceService {
  private meetingRooms: { [room: string]: any[] };
  currentDate: string = new Date().toISOString().slice(0, 10);
  constructor() {
    this.meetingRooms = {};
  }

  bookMeeting(
    username: string,
    room: string,
    date: string,
    startTime: string,
    endTime: string,
    agenda: string
  ): string | boolean {
    if (this.isRoomBooked(room, date, startTime, endTime)) {
      return 'conflict'; // Scheduling conflict
    }

    const newMeeting = {
      username: username,
      date: date,
      startTime: startTime,
      endTime: endTime,
      agenda: agenda,
    };

    if (this.meetingRooms[room]) {
      this.meetingRooms[room].push(newMeeting);
    } else {
      this.meetingRooms[room] = [newMeeting];
    }

    return true;
  }

  isRoomBooked(
    room: string,
    date: string,
    startTime: string,
    endTime: string
  ): boolean {
    if (!this.meetingRooms[room]) {
      return false;
    }

    const meetings = this.meetingRooms[room];
    for (const meeting of meetings) {
      if (
        meeting.date === date &&
        this.isTimeOverlap(
          meeting.startTime,
          meeting.endTime,
          startTime,
          endTime
        )
      ) {
        return true;
      }
    }

    return false;
  }

  isTimeOverlap(
    startTime1: string,
    endTime1: string,
    startTime2: string,
    endTime2: string
  ): boolean {
    const start1 = new Date(`${this.currentDate}T${startTime1}`);
    const end1 = new Date(`${this.currentDate}T${endTime1}`);
    const start2 = new Date(`${this.currentDate}T${startTime2}`);
    const end2 = new Date(`${this.currentDate}T${endTime2}`);

    return start1 <= end2 && end1 >= start2;
  }

  viewMeetings(room: string): Meeting[] {
    return this.meetingRooms[room] || [];
  }

  deleteMeeting(room: string, date: string, startTime: string) {
    if (this.meetingRooms[room]) {
      this.meetingRooms[room] = this.meetingRooms[room].filter(
        (meeting) => !(meeting.date === date && meeting.startTime === startTime)
      );
    }
  }

  getCurrentStatus(): { [room: string]: string } {
    const status: { [room: string]: string } = {};

    Object.entries(this.meetingRooms).forEach(([room, meetings]) => {
      const now = new Date();
      const currentMeeting = meetings.find((meeting) => {
        const meetingStartTime = new Date(
          `${meeting.date} ${meeting.startTime}`
        );
        const meetingEndTime = new Date(`${meeting.date} ${meeting.endTime}`);
        return meetingStartTime <= now && now < meetingEndTime;
      });

      if (currentMeeting) {
        status[room] = 'In-Use';
      } else {
        status[room] = 'Available';
      }
    });

    return status;
  }
}
