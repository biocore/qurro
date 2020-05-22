from qiime2.plugins import qurro as q2qurro


def test_citation_loaded():
    """Tests that loading Qurro's citation through QIIME 2 works."""

    # NOTE: I don't think the .__plugin__ property is necessarily a supported
    # part of the QIIME 2 API, so this test might get broken at some point if
    # the API changes. (If that happens we can just comment this test out,
    # since it isn't really a huge problem if this particular test breaks.)
    assert len(q2qurro.__plugin__.citations) == 1
    citation = q2qurro.__plugin__.citations[0]
    assert citation.type == "article"
    assert citation.fields["doi"] == "10.1093/nargab/lqaa023"
    assert citation.fields["author"] == (
        "Fedarko, Marcus W and Martino, Cameron and Morton, James T and "
        "González, Antonio and Rahman, Gibraan and Marotz, Clarisse A and "
        "Minich, Jeremiah J and Allen, Eric E and Knight, Rob"
    )
