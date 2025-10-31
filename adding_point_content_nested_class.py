#!/usr/bin/env python3
"""
HTML Format Converter - Converts old list-based format to new nested div format
Processes HTML files in parallel with progress tracking
"""

import os
import re
from pathlib import Path
from multiprocessing import Pool, cpu_count
from tqdm import tqdm
from bs4 import BeautifulSoup
import argparse


def has_point_content_class(html_content):
    """Check if HTML already has point-content class"""
    return 'class="point-content"' in html_content


def convert_li_to_div(html_content):
    """Convert <li class="point"> structure to <div class="point"> with nested point-content"""
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all <li class="point"> elements
    li_points = soup.find_all('li', class_='point')
    
    if not li_points:
        return None  # No conversion needed
    
    converted_count = 0
    
    for li in li_points:
        # Create new div with class="point"
        new_div = soup.new_tag('div', attrs={'class': 'point'})
        
        # Create nested div with class="point-content"
        content_div = soup.new_tag('div', attrs={'class': 'point-content'})
        
        # Find the verbal span (should be moved outside point-content)
        verbal_span = li.find('span', class_='verbal')
        
        # Move all children except verbal span into point-content
        for child in list(li.children):
            if child == verbal_span:
                continue
            # Clone the child and append to content_div
            content_div.append(child.extract())
        
        # Append content_div to new_div
        new_div.append(content_div)
        
        # Append verbal span to new_div (outside point-content)
        if verbal_span:
            new_div.append(verbal_span.extract())
        
        # Replace li with new_div
        li.replace_with(new_div)
        converted_count += 1
    
    if converted_count > 0:
        return str(soup)
    return None


def process_file(filepath):
    """Process a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already converted
        if has_point_content_class(content):
            return filepath, 'skipped', 'Already has point-content class'
        
        # Check if it has the old format
        if '<li class="point">' not in content:
            return filepath, 'skipped', 'No li.point elements found'
        
        # Convert the format
        converted = convert_li_to_div(content)
        
        if converted is None:
            return filepath, 'skipped', 'No conversion performed'
        
        # Write back to file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(converted)
        
        return filepath, 'success', 'Converted successfully'
    
    except Exception as e:
        return filepath, 'error', str(e)


def find_html_files(directory):
    """Find all HTML files in directory and subdirectories"""
    html_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.html', '.htm')):
                html_files.append(os.path.join(root, file))
    return html_files


def main():
    parser = argparse.ArgumentParser(
        description='Convert HTML files from li.point to div.point with nested point-content'
    )
    parser.add_argument(
        'directory',
        nargs='?',
        default='.',
        help='Directory to process (default: current directory)'
    )
    parser.add_argument(
        '--workers',
        type=int,
        default=cpu_count(),
        help=f'Number of worker processes (default: {cpu_count()})'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be converted without making changes'
    )
    
    args = parser.parse_args()
    
    # Find all HTML files
    print(f"Scanning for HTML files in: {args.directory}")
    html_files = find_html_files(args.directory)
    
    if not html_files:
        print("No HTML files found!")
        return
    
    print(f"Found {len(html_files)} HTML file(s)")
    print(f"Using {args.workers} worker process(es)")
    
    if args.dry_run:
        print("\n*** DRY RUN MODE - No files will be modified ***\n")
    
    # Process files with multiprocessing and progress bar
    results = {
        'success': [],
        'skipped': [],
        'error': []
    }
    
    with Pool(processes=args.workers) as pool:
        # Use tqdm for progress bar
        for filepath, status, message in tqdm(
            pool.imap_unordered(process_file, html_files),
            total=len(html_files),
            desc="Processing files",
            unit="file"
        ):
            results[status].append((filepath, message))
    
    # Print summary
    print("\n" + "="*70)
    print("CONVERSION SUMMARY")
    print("="*70)
    
    print(f"\n✓ Successfully converted: {len(results['success'])}")
    if results['success'] and len(results['success']) <= 10:
        for filepath, msg in results['success']:
            print(f"  - {filepath}")
    elif results['success']:
        for filepath, msg in results['success'][:5]:
            print(f"  - {filepath}")
        print(f"  ... and {len(results['success']) - 5} more")
    
    print(f"\n⊘ Skipped: {len(results['skipped'])}")
    if results['skipped'] and len(results['skipped']) <= 5:
        for filepath, msg in results['skipped']:
            print(f"  - {filepath}: {msg}")
    
    print(f"\n✗ Errors: {len(results['error'])}")
    if results['error']:
        for filepath, msg in results['error']:
            print(f"  - {filepath}: {msg}")
    
    print("\n" + "="*70)


if __name__ == "__main__":
    main()