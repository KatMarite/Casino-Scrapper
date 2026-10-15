import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import scraper


def source_table(rows):
    header = '<tr><th>Casino</th><th>Bonus</th><th>Wagering</th><th>Min Dep.</th></tr>'
    body = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in row) + '</tr>' for row in rows)
    return '<table>' + header + body + '</table>'


ROWS = [('1 Alpha', '100% up to €500 + 20 FS', '35x', '€20'),
        ('2 Unknown', 'See promotion', 'Varies', 'In cashier'),
        ('3 Beta', 'Up to $2,000 across 4 deposits', '40x', '$30'),
        ('4 Gamma', '100% up to £100', '0x', '£10')]


class ScraperTests(unittest.TestCase):
    def test_selects_complete_rows_preserving_qualifiers(self):
        terms = scraper.select_terms(source_table(ROWS))
        self.assertEqual([t['casino'] for t in terms], ['Alpha', 'Beta', 'Gamma'])
        self.assertEqual(terms[1]['bonus_text'], 'Up to $2,000 across 4 deposits')
        self.assertEqual(terms[1]['deposit_text'], '$30')

    def test_changed_layout_fails(self):
        with self.assertRaises(scraper.ScrapeError):
            scraper.select_terms(source_table(ROWS).replace('Min Dep.', 'Something Else'))

    def test_range_is_not_silently_reduced(self):
        rows = copy.deepcopy(ROWS)
        rows[0] = ('Alpha', '€500 welcome', '35–40x', '€20')
        with self.assertRaises(scraper.ScrapeError):
            scraper.select_terms(source_table(rows))

    def test_block_page_fails(self):
        with self.assertRaises(scraper.ScrapeError):
            scraper.select_terms('<title>Just a moment...</title>')

    def test_robots_wildcards_and_allow_precedence(self):
        policy = scraper.RobotsPolicy('User-agent: *\nDisallow: /*?*\nDisallow: /private\nAllow: /private/public$')
        self.assertTrue(policy.allows('https://example.org/casino'))
        self.assertFalse(policy.allows('https://example.org/casino?q=a'))
        self.assertFalse(policy.allows('https://example.org/private'))
        self.assertTrue(policy.allows('https://example.org/private/public'))
        self.assertFalse(policy.allows('https://example.org/private/public/more'))

    def test_specific_agent_group_and_delay(self):
        policy = scraper.RobotsPolicy('User-agent: *\nDisallow: /\nUser-agent: CasinoBonusScreening\nAllow: /\nCrawl-delay: 5')
        self.assertTrue(policy.allows(scraper.SOURCE))
        self.assertEqual(policy.delay, 5)

    def test_empty_robots_allows(self):
        self.assertTrue(scraper.RobotsPolicy('# comments only').allows(scraper.SOURCE))

    def test_model_output_is_grounded(self):
        terms = scraper.select_terms(source_table(ROWS))
        records = [{'casino': t['casino'], 'welcome_bonus': t['bonus_text'],
                    'wagering_requirement': float(t['wagering_text'][:-1]),
                    'minimum_deposit': t['deposit_text']} for t in terms]
        scraper.validate_records(records, terms)
        for field, bad in [('wagering_requirement', 99), ('wagering_requirement', True),
                           ('minimum_deposit', '20 USD'), ('welcome_bonus', 'Invented')]:
            changed = copy.deepcopy(records)
            changed[0][field] = bad
            with self.subTest(field=field, bad=bad), self.assertRaises(scraper.ScrapeError):
                scraper.validate_records(changed, terms)

    def test_atomic_json_is_readable_utf8(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'nested' / 'data.json'
            scraper.atomic_json(path, {'bonus': '€20'})
            self.assertEqual(json.loads(path.read_text(encoding='utf-8')), {'bonus': '€20'})
            self.assertFalse(path.with_suffix('.json.tmp').exists())

    def test_api_failure_preserves_last_good_output(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            scraper.atomic_json(root / 'dist' / 'bonuses.json', {'last_good': True})
            with patch.object(scraper, 'ROOT', root), patch.dict('os.environ', {'OPENAI_API_KEY': 'test'}), \
                 patch.object(scraper.time, 'sleep'), \
                 patch.object(scraper, 'fetch', side_effect=[('# allowed', 200), (source_table(ROWS), 200), scraper.ScrapeError('HTTP 401')]):
                with self.assertRaises(scraper.ScrapeError):
                    scraper.run('test-model')
            self.assertEqual(json.loads((root / 'dist' / 'bonuses.json').read_text()), {'last_good': True})
            self.assertTrue((root / 'evidence' / 'source-fetch.json').exists())

    def test_robots_denial_prevents_page_and_api_requests(self):
        with patch.dict('os.environ', {'OPENAI_API_KEY': 'test'}), \
             patch.object(scraper, 'fetch', return_value=('User-agent: *\nDisallow: /', 200)) as fetch:
            with self.assertRaises(scraper.ScrapeError):
                scraper.run('test-model')
            self.assertEqual(fetch.call_count, 1)


if __name__ == '__main__':
    unittest.main()
