import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@shared';
import { UserDTO, UserRequestDTO } from '../../models/dtos/user.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  private config = inject(APP_CONFIG);

  private apiUrl = `${this.config.apiUrl}/users`;

  getUsers(role?: string): Observable<UserDTO[]> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    params = params.set('t', new Date().getTime().toString());

    return this.http.get<UserDTO[]>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${id}`);
  }

  createUser(userRequest: UserRequestDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.apiUrl, userRequest);
  }

  updateUser(id: number, userRequest: UserRequestDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}`, userRequest);
  }

  toggleUserStatus(id: number, isActive: boolean): Observable<UserDTO> {
    return this.http.patch<UserDTO>(`${this.apiUrl}/${id}/status`, { isActive });
  }
}
