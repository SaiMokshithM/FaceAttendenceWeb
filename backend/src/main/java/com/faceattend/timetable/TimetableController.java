package com.faceattend.timetable;

import com.faceattend.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableRepository timetableRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimetableDto>>> getAll() {
        List<TimetableDto> list = timetableRepo.findAllOrdered()
                .stream().map(TimetableDto::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/day/{day}")
    public ResponseEntity<ApiResponse<List<TimetableDto>>> getByDay(@PathVariable int day) {
        List<TimetableDto> list = timetableRepo.findByDayOfWeekOrderByPeriodPeriodNumber(day)
                .stream().map(TimetableDto::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
