#!/usr/bin/env python3
"""CP3403 Week 03 companion. No CSV download or invented BlackFriday results.
Install pandas and mlxtend in your chosen Python environment, then run this file.
Use --blackfriday PATH for the real course file; --sample PATH for the small CSV.
"""
from __future__ import annotations
import argparse
import inspect
import json
from pathlib import Path
import numpy as np
import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules, fpgrowth

LECTURE = [
    ['Apple', 'Coke', 'DVD'], ['Bread', 'Coke', 'Egg'],
    ['Apple', 'Bread', 'Coke', 'Egg'], ['Bread', 'Egg'],
]

def encode(transactions):
    te = TransactionEncoder()
    values = te.fit(transactions).transform(transactions)
    return pd.DataFrame(values, columns=te.columns_, dtype=bool)

def read_sample(path):
    raw = pd.read_csv(path, keep_default_na=False)
    if 'transID' not in raw:
        raise ValueError('Expected transID. Identify/remove the actual row ID before mining.')
    clean = raw.drop(columns='transID').replace('?', 0)
    numeric = clean.apply(pd.to_numeric, errors='raise')
    if not numeric.isin([0, 1]).all().all():
        raise ValueError('Sample values must be documented absence ?, 0, or 1. Unknown data is not False.')
    return numeric.astype(bool)

def read_blackfriday(path, include_absence=False):
    raw = pd.read_csv(path)
    columns = ['Product_Category_1', 'Product_Category_2', 'Product_Category_3', 'Purchase']
    missing = set(columns) - set(raw.columns)
    if missing:
        raise ValueError(f'Missing expected columns: {sorted(missing)}')
    data = raw.loc[:, columns].copy()
    purchase = pd.to_numeric(data['Purchase'], errors='raise')
    if purchase.isna().any() or not np.isfinite(purchase).all() or (purchase < 0).any():
        raise ValueError('Purchase must contain observed finite, nonnegative amounts.')
    if data['Product_Category_1'].isna().any():
        raise ValueError('Primary categories are missing. Investigate them before mining.')
    for column in columns[:3]:
        values = pd.to_numeric(data[column], errors='raise')
        present = values.dropna()
        if not np.isfinite(present).all() or (present < 0).any() or (present % 1 != 0).any():
            raise ValueError(f'{column} must contain integer category codes or documented absence.')
        data[column] = values
    try:
        bands, edges = pd.qcut(purchase, 3, labels=['Low', 'Medium', 'High'], retbins=True)
    except ValueError as exc:
        raise ValueError('Cannot form three distinct purchase quantiles. Inspect ties and choose a justified bin policy.') from exc
    transactions = []
    for position, row in enumerate(data.itertuples(index=False, name=None)):
        categories = sorted({int(value) for value in row[:3] if pd.notna(value) and value != 0})
        if not categories:
            raise ValueError(f'Row {position} has no product category.')
        tokens = [f'Cat={value}' for value in categories]
        if include_absence and all(pd.isna(value) or value == 0 for value in row[1:3]):
            tokens.append('NoExtraCategory')
        tokens.append(f'Purchase={bands.iloc[position]}')
        transactions.append(tokens)
    return encode(transactions), edges.tolist()

def make_rules(frequent, encoded, minimum_confidence):
    if frequent.empty or not frequent['itemsets'].map(len).ge(2).any():
        return pd.DataFrame(columns=['antecedents', 'consequents', 'support', 'confidence', 'lift'])
    kwargs = {'metric': 'confidence', 'min_threshold': minimum_confidence}
    if 'num_itemsets' in inspect.signature(association_rules).parameters:
        kwargs['num_itemsets'] = len(encoded)
    result = association_rules(frequent, **kwargs)
    return result.sort_values(['lift', 'confidence'], ascending=False)

def analyse(encoded, minimum_support, minimum_confidence, title):
    if encoded.empty or not all(dtype == bool for dtype in encoded.dtypes):
        raise ValueError('Use nonempty Boolean rows with named item columns.')
    frequent_a = apriori(encoded, min_support=minimum_support, use_colnames=True)
    frequent_f = fpgrowth(encoded, min_support=minimum_support, use_colnames=True)
    a = {frozenset(row.itemsets): row.support for row in frequent_a.itertuples()}
    f = {frozenset(row.itemsets): row.support for row in frequent_f.itertuples()}
    if a.keys() != f.keys() or any(not np.isclose(value, f[items]) for items, value in a.items()):
        raise AssertionError('Apriori and FP-growth disagree on identical Boolean input.')
    rules = make_rules(frequent_a, encoded, minimum_confidence)
    patterns = [{'items': sorted(items), 'count': int(round(support * len(encoded))), 'support': float(support)} for items, support in a.items()]
    patterns.sort(key=lambda row: (len(row['items']), row['items']))
    output = {
        'title': title, 'transaction_unit': 'one supplied row', 'rows': len(encoded),
        'minimum_support': minimum_support, 'minimum_confidence': minimum_confidence,
        'miners_agree': True, 'frequent_itemsets': patterns,
        'rules': [{'antecedent': sorted(row.antecedents), 'consequent': sorted(row.consequents),
                   'support': float(row.support), 'confidence': float(row.confidence), 'lift': float(row.lift)} for row in rules.itertuples()],
    }
    print(f"{title}: {len(encoded)} rows, {len(patterns)} frequent itemsets, {len(rules)} strong rules. Both miners agree.")
    if not rules.empty:
        display = rules.loc[:, ['antecedents', 'consequents', 'support', 'confidence', 'lift']].copy()
        for column in ['antecedents', 'consequents']:
            display[column] = display[column].map(lambda items: ', '.join(sorted(items)))
        print(display.head(20).to_string(index=False))
    return output

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sample', type=Path)
    parser.add_argument('--blackfriday', type=Path)
    parser.add_argument('--include-absence', action='store_true', help='Make documented absence of an extra category a separate item.')
    parser.add_argument('--support', type=float, help='Default: 0.5 for sample, 0.2 for BlackFriday.')
    parser.add_argument('--confidence', type=float, help='Default: 0.9 for sample, 0.5 for BlackFriday.')
    parser.add_argument('--output', type=Path, help='Optional path for inspectable JSON results.')
    args = parser.parse_args()
    if args.support is not None and not 0 < args.support <= 1:
        parser.error('--support must be in (0,1].')
    if args.confidence is not None and not 0 <= args.confidence <= 1:
        parser.error('--confidence must be in [0,1].')
    results = []
    if args.sample:
        results.append(analyse(read_sample(args.sample), args.support or 0.5, 0.9 if args.confidence is None else args.confidence, 'Supplied small sample CSV'))
    elif not args.blackfriday:
        results.append(analyse(encode(LECTURE), args.support or 0.5, 0.9 if args.confidence is None else args.confidence, 'Lecture source baskets'))
        practical = [['MP3' if item == 'DVD' else item for item in basket] for basket in LECTURE]
        results.append(analyse(encode(practical), args.support or 0.5, 0.9 if args.confidence is None else args.confidence, 'Practical screenshot rows (MP3)'))
    if args.blackfriday:
        encoded, edges = read_blackfriday(args.blackfriday, args.include_absence)
        result = analyse(encoded, args.support or 0.2, 0.5 if args.confidence is None else args.confidence, 'Real supplied BlackFriday product records')
        result['purchase_quantile_edges'] = edges
        result['transaction_unit'] = 'one product record; not an inferred multi-product basket'
        results.append(result)
    if args.output:
        args.output.write_text(json.dumps(results, indent=2, allow_nan=False) + '\n', encoding='utf-8')

if __name__ == '__main__':
    main()
