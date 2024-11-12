import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
	selector: 'app-boxes',
	standalone: true,
	imports: [CommonModule, FormsModule, HttpClientModule],
	templateUrl: './boxes.component.html',
	styleUrl: './boxes.component.scss'
})

export class BoxesComponent implements OnInit {
	totalSquares: number = 100;
	selectedSquares: Set<number> = new Set();
	lastSelectedIndex: number = 0;
	addBoxesCount: number = 0;
	previousSelectedRange: { start: number; end: number; } | undefined;
	columnSize: number = 8; // Default column size
  	screenWidth: number = window.innerWidth;

	constructor(private http: HttpClient) {}

	ngOnInit(): void {
		this.updateColumnSize();
		this.loadUserBoxInfo();
	}

	@HostListener('window:resize', ['$event'])
	onResize(event: Event): void {
		this.screenWidth = window.innerWidth;
		this.updateColumnSize();
	}

	updateColumnSize(): void {
			switch(true) {
				case this.screenWidth <= 480:
					this.columnSize = 2;
					break;
				case this.screenWidth >= 480 && this.screenWidth <= 768:
					this.columnSize = 4;
					break;
				case this.screenWidth >= 768 && this.screenWidth <= 1024:
					this.columnSize = 6;
					break;
				case this.screenWidth >= 1024:
					this.columnSize = 8;
					break;
			}
		}


	toggleSelection(index: number, event: MouseEvent): void {
		const totalRows = Math.ceil(this.totalSquares / this.columnSize); // Calculate the maximum number of columns

		if (event.shiftKey && this.lastSelectedIndex !== null) {
			// Select a range of boxes between the last selected box and the current one
			const start = Math.min(this.lastSelectedIndex, index);
			const end = Math.max(this.lastSelectedIndex, index);

			if (index <= this.lastSelectedIndex) {
				for (let i = index + 1; i <= this.lastSelectedIndex; i++) this.selectedSquares.delete(i);
			} else if (index >= this.lastSelectedIndex) { // If the new selection is larger, select the new range
				for (let i = start; i <= end; i++) this.selectedSquares.add(i);

			}
		} else if(event.altKey && this.lastSelectedIndex !== null) {
			const start = this.lastSelectedIndex;
			const end = index;  // The new last index

			// Store the column and row for the start and end indices
			const startColumn = start % this.columnSize;
			const endColumn = end % this.columnSize;
			const startRow = Math.floor(start / this.columnSize);
			const endRow = Math.floor(end / this.columnSize);

			// Remove items from previous range
			if (this.previousSelectedRange) {
				// const prevStart = this.previousSelectedRange.start;
				const prevEnd = this.previousSelectedRange.end;

				if (prevEnd !== end) { // If the previous end is different from the new end, we need to remove items in between
					// Loop over columns between prevEnd and new end
					const prevEndColumn = prevEnd % this.columnSize;
					const newEndColumn = end % this.columnSize;

					const prevEndRow = Math.floor(prevEnd / this.columnSize);
					const newEndRow = Math.floor(end / this.columnSize);

					// Determine the direction of range to remove
					let startRemoveCol = prevEndColumn;
					let endRemoveCol = newEndColumn;
					let startRemoveRow = prevEndRow;
					let endRemoveRow = newEndRow;

					// If the new end is before the previous end, adjust the columns and rows
					if (newEndColumn < prevEndColumn || (newEndColumn === prevEndColumn && newEndRow < prevEndRow)) {
						startRemoveCol = newEndColumn;
						endRemoveCol = prevEndColumn;
						startRemoveRow = newEndRow;
						endRemoveRow = prevEndRow;
					}

					// Remove items in the selected range
					for (let col = startRemoveCol; col <= endRemoveCol; col++) {
						const columnStartRow = (col === startRemoveCol) ? startRemoveRow : 0;
						const columnEndRow = (col === endRemoveCol) ? endRemoveRow : totalRows - 1;

						for (let row = columnStartRow; row <= columnEndRow; row++) {
							const verticalIndex = row * this.columnSize + col;
							if (verticalIndex <= this.totalSquares && this.selectedSquares.has(verticalIndex)) this.selectedSquares.delete(verticalIndex);
						}
					}
				}
			}

			// Select the new range (start to end)
			for (let col = startColumn; col <= endColumn; col++) {
				const columnStartRow = (col === startColumn) ? startRow : 0;
				const columnEndRow = (col === endColumn) ? endRow : totalRows - 1;

				for (let row = columnStartRow; row <= columnEndRow; row++) {
					const verticalIndex = row * this.columnSize + col;
					if (verticalIndex <= this.totalSquares) this.selectedSquares.add(verticalIndex); // Only select if within bounds and not already selected
				}
			}

			this.previousSelectedRange = { start, end }; // Update the previous selected range to current one
		} else { // Select the single box or toggle selection of the box
			if (this.selectedSquares.has(index)) {
				this.selectedSquares.delete(index);
			} else {
				if(!event.ctrlKey) if(this.selectedSquares.size > 0) this.selectedSquares.clear();
				this.selectedSquares.add(index);
			}
		}

		this.lastSelectedIndex = index; // Update the last selected index
	}

	isSelected(index: number): boolean {
		return this.selectedSquares.has(index);
	}

	get squares(): number[] {
		return Array.from({ length: this.totalSquares + 1 }, (_, index) => index);
	}

	addSquares(): void {
		if(this.addBoxesCount > 0) this.totalSquares += this.addBoxesCount;
	}

	saveUserSquares(isReset: boolean): void {
		const selectedArray = Array.from(this.selectedSquares);

		this.http.post('http://localhost:3000/user/saveBoxInfo', {
			totalSquares: isReset ? 100 : this.totalSquares,
			selectedSquares: isReset ? 0 : selectedArray,
			isReset: isReset
		}, {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
			})
		}).pipe(catchError(err => {
			console.error('Box update failed', err);
			return of(null);
		})).subscribe((response: any) => {
			if (response) {
				console.log('Box info saved successfully', response);
				alert('Box info saved successfully');
				if(isReset) {
					this.totalSquares = 100;
					this.selectedSquares = new Set();
				}
			}
		});
	}

	loadUserBoxInfo(): void {
		this.http.get<{ totalSquares: number, selectedSquares: number[] }>('http://localhost:3000/user/getBoxInfo', {
			headers: new HttpHeaders({
				'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
			})
		}).subscribe((response) => {
			if (response) {
				this.totalSquares = response.totalSquares;
				this.selectedSquares = new Set(response.selectedSquares);
			}
		}, (error) => console.error('Error loading box info', error));
	}
}