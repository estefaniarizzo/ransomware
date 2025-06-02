from flask import Flask, render_template, request, jsonify
import requests
from collections import Counter

app = Flask(__name__)
BASE_URL = "https://api.ransomware.live/v2"

def get_victims():
    try:
        response = requests.get(f"{BASE_URL}/recentvictims", timeout=10)
        response.raise_for_status()
        return response.json()  # API devuelve lista directamente
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        return []

def filter_victims(victims, country=None, sector=None, group=None):
    filtered = victims
    if country:
        filtered = [v for v in filtered if v.get('country', '').lower() == country.lower()]
    if sector:
        filtered = [v for v in filtered if v.get('sector', '').lower() == sector.lower()]
    if group:
        groups = [g.strip().lower() for g in group.split(',')]
        filtered = [v for v in filtered if v.get('group', '').lower() in groups]
    return filtered

def prepare_chart_data(victims):
    return {
        'by_country': Counter(v['country'] for v in victims if v.get('country')),
        'by_group': Counter(v['group'] for v in victims if v.get('group')),
        'timeline': process_timeline(victims)
    }

def process_timeline(victims):
    # Agrupar por mes-año para mejor visualización
    dates = []
    for v in victims:
        if v.get('attackdate'):
            try:
                # Asume formato YYYY-MM-DD
                month_year = v['attackdate'][:7]  # "2025-05"
                dates.append(month_year)
            except:
                continue
    return Counter(dates)

@app.route('/')
def index():
    try:
        victims = get_victims()
        filtered = filter_victims(
            victims,
            country=request.args.get('country'),
            sector=request.args.get('sector'),
            group=request.args.get('group')
        )
        return render_template(
            'index.html',
            victims=filtered,
            chart_data=prepare_chart_data(filtered),
            total=len(filtered)
        )
    except Exception as e:
        print(f"Error: {e}")
        return render_template('error.html', error="System error"), 500

@app.route('/data')
def json_data():
    try:
        victims = get_victims()
        filtered = filter_victims(
            victims,
            country=request.args.get('country'),
            sector=request.args.get('sector'),
            group=request.args.get('group')
        )
        return jsonify({
            'victims': filtered,
            'chart_data': prepare_chart_data(filtered),
            'total': len(filtered)
        })
    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({'error': 'Could not load data'}), 500

if __name__ == "__main__":
    app.run(debug=True)