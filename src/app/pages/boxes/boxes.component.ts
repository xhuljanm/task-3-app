import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-boxes',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './boxes.component.html',
	styleUrl: './boxes.component.scss'
})

export class BoxesComponent implements OnInit {
	totalSquares: number = 10;
	selectedSquares: Set<number> = new Set();
	lastSelectedIndex: number = 0;
	addBoxesCount: number = 0;

	constructor() {}

	ngOnInit(): void {}

	toggleSelection(index: number, event: MouseEvent): void {
		if (event.shiftKey && this.lastSelectedIndex !== null) {
			// Select a range of boxes between the last selected box and the current one
			const start = Math.min(this.lastSelectedIndex, index);
			const end = Math.max(this.lastSelectedIndex, index);

			if (index < this.lastSelectedIndex) {
				for (let i = index + 1; i <= this.lastSelectedIndex; i++) this.selectedSquares.delete(i);
			} else if (index > this.lastSelectedIndex) { // If the new selection is larger, select the new range
				for (let i = start; i <= end; i++) this.selectedSquares.add(i);
			}
		} else { // Select the single box or toggle selection of the box
			if (this.selectedSquares.has(index)) this.selectedSquares.delete(index);
			else this.selectedSquares.add(index);
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
}